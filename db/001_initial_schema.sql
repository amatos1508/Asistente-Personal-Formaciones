-- Initial schema for Asistente Personal de Formaciones.
-- This file is a reviewed migration proposal; it is not executed automatically.
-- Apply only after confirming the connected Neon database is the dedicated project database.

BEGIN;

CREATE TABLE IF NOT EXISTS course_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  standard_hours numeric(7,2) NOT NULL CHECK (standard_hours > 0),
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  email text,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('webex', 'teams')),
  account_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, account_name)
);

CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_code text NOT NULL UNIQUE,
  course_id uuid REFERENCES course_catalog(id) ON DELETE RESTRICT,
  title text NOT NULL,
  training_type text NOT NULL CHECK (training_type IN ('open', 'company')),
  company_name text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'archived')),
  standard_hours_snapshot numeric(7,2) CHECK (standard_hours_snapshot IS NULL OR standard_hours_snapshot > 0),
  sold_hours numeric(7,2) CHECK (sold_hours IS NULL OR sold_hours >= 0),
  custom_hours boolean NOT NULL DEFAULT false,
  control_folder_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (training_type <> 'company' OR NULLIF(trim(company_name), '') IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  session_number integer NOT NULL CHECK (session_number > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  instructor_id uuid REFERENCES instructors(id) ON DELETE SET NULL,
  meeting_account_id uuid REFERENCES meeting_accounts(id) ON DELETE SET NULL,
  meeting_url text,
  attendance_report_received boolean NOT NULL DEFAULT false,
  session_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  UNIQUE (training_id, session_number)
);

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  grade numeric(5,2),
  result text NOT NULL DEFAULT 'pending'
    CHECK (result IN ('pending', 'passed', 'failed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_id, participant_id)
);

CREATE TABLE IF NOT EXISTS participant_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_participant_id uuid NOT NULL REFERENCES training_participants(id) ON DELETE CASCADE,
  certification_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_participant_id, certification_code)
);

CREATE TABLE IF NOT EXISTS session_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE RESTRICT,
  attendance_status text NOT NULL CHECK (attendance_status IN ('present', 'absent', 'partial', 'unknown')),
  minutes_attended integer CHECK (minutes_attended IS NULL OR minutes_attended >= 0),
  source_file_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id)
);

CREATE TABLE IF NOT EXISTS training_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('create_meeting', 'send_invitations', 'send_closure_email')),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_id, task_type)
);

CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
CREATE INDEX IF NOT EXISTS idx_trainings_type ON trainings(training_type);
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON training_sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_instructor_time ON training_sessions(instructor_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_sessions_meeting_account_time ON training_sessions(meeting_account_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_training_participants_training ON training_participants(training_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_participant_certifications_link ON participant_certifications(training_participant_id);

COMMIT;
