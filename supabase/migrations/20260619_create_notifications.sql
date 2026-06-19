-- Create notifications table for in-app notification system
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'stock', 'sync')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Store members can view their store's notifications
DROP POLICY IF EXISTS "Members can view notifications" ON notifications;
CREATE POLICY "Members can view notifications"
  ON notifications FOR SELECT
  USING (store_id IN (
    SELECT store_id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Store members can mark notifications as read
DROP POLICY IF EXISTS "Members can update notifications" ON notifications;
CREATE POLICY "Members can update notifications"
  ON notifications FOR UPDATE
  USING (store_id IN (
    SELECT store_id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_store_id_read ON notifications (store_id, is_read, created_at DESC);
