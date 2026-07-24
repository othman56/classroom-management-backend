CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER departments_set_updated_at_trigger
BEFORE UPDATE ON "departments"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER subjects_set_updated_at_trigger
BEFORE UPDATE ON "subjects"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();