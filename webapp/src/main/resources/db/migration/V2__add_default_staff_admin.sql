-- Insert Default Admin User
-- Password is 'password123'
INSERT INTO users (email, password_hash, full_name, ghana_card_id, phone_number, profile)
VALUES (
    'admin@undawriter.com',
    'password123',
    'John Admin',
    'GHA-ADMIN-001',
    '+233201234568',
    'ADMIN'
);

-- Insert Default Staff User
-- Password is 'password123'
INSERT INTO users (email, password_hash, full_name, ghana_card_id, phone_number, profile)
VALUES (
    'staff@undawriter.com',
    'password123',
    'Jane Staff',
    'GHA-STAFF-001',
    '+233201234567',
    'STAFF'
);
