# rudkin-athlete
This is a two part project with a react client and a nodeJS api.
The main files to edit will be client/src/components/Form.tsx which is the form, and server/server.ts which is the server application. 

To upload client to hosting:
- Run the command “npm run build” in the client directory
- This will create a folder called dist, simply upload everything inside this folder to the public_HTML directory in cpanel.
To upload the server:
- Upload server.ts to the server.athletes-profile.com directory
- Compile the typescript file to javascript using the command tsc server.ts (can also be done before uploading and simply uploading the resulting javascript file instead)
- In App.tsx, axios.defaults.baseURL must be changed to https://server.athletes-profile.com
To start the server:
- SSH into the hosting service using the command "ssh -oHostKeyAlgorithms=+ssh-rsa [USERNAME]@athletes-profile.com
- Enter your password
- Go to the server directory using the command "cd public_html/server.athletes-profile.com/"
- Start the server using the command "pm2 start server.js"

When adding/removing node packages make sure dependencies are installed by running the command "npm install"
Example
- For client: in ssh, go into the public_html directory using the command "cd public_html" then run command "npm install"
- For server: in ssh, go into the public_html/server.athletes-profile.com directory using the command "cd public_html/server.athletes-profile.com then run the command "npm install"
