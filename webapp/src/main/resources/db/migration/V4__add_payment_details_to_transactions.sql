ALTER TABLE transactions ADD COLUMN payment_channel VARCHAR(255);
ALTER TABLE transactions ADD COLUMN mobile_network VARCHAR(255);
ALTER TABLE transactions ADD COLUMN mobile_number VARCHAR(255);
ALTER TABLE transactions ADD COLUMN card_last4 VARCHAR(4);
