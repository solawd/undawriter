CREATE TABLE claim_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES claim_messages(id)
);

CREATE INDEX idx_claim_messages_claim_id ON claim_messages(claim_id);
CREATE INDEX idx_claim_messages_parent_id ON claim_messages(parent_id);
