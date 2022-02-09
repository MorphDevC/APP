1. Create dump





2. Restore
2.1 In folder 'ArangoDB3 3.8.2/usr/bin' open cmd
2.2 Command: 
arangorestore --server.endpoint tcp://127.0.0.1:8529 --server.username root --server.password qwerty --server.database test --input-directory "C:\ProgramData\ArangoDB-apps\_db\StoreDB_en\final_functions\APP\bundle\dump"