-- Organizations table for B2B corporate accounts
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  admin_user_id uuid REFERENCES users(id),
  plan text NOT NULL DEFAULT 'team' CHECK (plan IN ('team', 'enterprise')),
  max_seats integer NOT NULL DEFAULT 10,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization memberships
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage orgs" ON organizations FOR ALL
  USING (admin_user_id = auth.uid());
CREATE POLICY "Members can view own org" ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can view own membership" ON organization_members FOR SELECT
  USING (user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Org admins can manage members" ON organization_members FOR ALL
  USING (organization_id IN (
    SELECT id FROM organizations WHERE admin_user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
