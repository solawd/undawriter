DELETE FROM claims WHERE policy_id IN (SELECT id FROM policies WHERE user_id = (SELECT id FROM users WHERE email = 'kofiapenya@gmail.com'));
DELETE FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = 'kofiapenya@gmail.com');
DELETE FROM motor_details WHERE policy_id IN (SELECT id FROM policies WHERE user_id = (SELECT id FROM users WHERE email = 'kofiapenya@gmail.com'));
DELETE FROM travel_details WHERE policy_id IN (SELECT id FROM policies WHERE user_id = (SELECT id FROM users WHERE email = 'kofiapenya@gmail.com'));
DELETE FROM home_details WHERE policy_id IN (SELECT id FROM policies WHERE user_id = (SELECT id FROM users WHERE email = 'kofiapenya@gmail.com'));
DELETE FROM policies WHERE user_id = (SELECT id FROM users WHERE email = 'kofiapenya@gmail.com');
DELETE FROM users WHERE email = 'kofiapenya@gmail.com';
