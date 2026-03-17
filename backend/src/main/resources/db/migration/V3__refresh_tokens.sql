CREATE TABLE refresh_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token VARCHAR(128) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked BIT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT uk_refresh_tokens_token UNIQUE (token),
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_expires (expires_at)
);

