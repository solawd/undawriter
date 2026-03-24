CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    ghana_card_id VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(255) NOT NULL,
    profile VARCHAR(32) DEFAULT 'CUSTOMER' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_type VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'PENDING' NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_net DECIMAL(38, 2) NOT NULL,
    total_paid DECIMAL(38, 2) DEFAULT 0 NOT NULL,
    nic_sticker_id VARCHAR(255),
    policy_document_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_id BIGINT NOT NULL,
    status VARCHAR(255) DEFAULT 'SUBMITTED' NOT NULL,
    payout_type VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_urls TEXT,
    adjuster_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    policy_id BIGINT NOT NULL,
    amount DECIMAL(38, 2) NOT NULL,
    type VARCHAR(255) DEFAULT 'PAYMENT' NOT NULL,
    status VARCHAR(255) DEFAULT 'SUCCESS' NOT NULL,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE TABLE IF NOT EXISTS home_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_id BIGINT NOT NULL UNIQUE,
    ghana_post_gps VARCHAR(255) NOT NULL,
    property_type VARCHAR(255) NOT NULL,
    wall_material VARCHAR(255) NOT NULL,
    roof_material VARCHAR(255) NOT NULL,
    occupancy VARCHAR(255) NOT NULL,
    sum_insured_building DECIMAL(38, 2) NOT NULL,
    sum_insured_contents DECIMAL(38, 2) NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE TABLE IF NOT EXISTS motor_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_id BIGINT NOT NULL UNIQUE,
    reg_number VARCHAR(255) NOT NULL,
    chassis_number VARCHAR(17) NOT NULL,
    make_model VARCHAR(255) NOT NULL,
    manufacture_year INT NOT NULL,
    body_type VARCHAR(255) NOT NULL,
    seating_capacity INT NOT NULL,
    sum_insured DECIMAL(38, 2) NOT NULL,
    usage VARCHAR(255) NOT NULL,
    coverage_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE TABLE IF NOT EXISTS travel_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_id BIGINT NOT NULL UNIQUE,
    passport_number VARCHAR(255) NOT NULL,
    country_of_issue VARCHAR(255) NOT NULL,
    destination_region VARCHAR(255) NOT NULL,
    trip_purpose VARCHAR(255) NOT NULL,
    next_of_kin_contact VARCHAR(255) NOT NULL,
    pre_existing_conditions BOOLEAN NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);
