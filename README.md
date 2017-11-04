# raw -> gateway
raw input from rovers and bases

# gateway -> wrapper

# wrapper -> gateway -> faye

# faye -> dashboard

# dashboard -> dashboard server


# Data flow
raw_mock_pub -> raw_frame -> raw_parser -> wrapper_mock -># gateway
