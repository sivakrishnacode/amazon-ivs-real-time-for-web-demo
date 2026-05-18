curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: M738diLr2xJapjWfioKn" \
  -d '{"hostAttributes":{"username":"SivaKrishna"},"hostId":"siva-user-id","type":"VIDEO","cid":"k0ljndvw90"}' \
  https://k0ljndvw90.execute-api.us-east-1.amazonaws.com/prod/create


curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: M738diLr2xJapjWfioKn" \
  -d '{"attributes":{"username":"GuestUser"},"userId":"guest-user-id","hostId":"siva-user-id"}' \
  https://k0ljndvw90.execute-api.us-east-1.amazonaws.com/prod/join
