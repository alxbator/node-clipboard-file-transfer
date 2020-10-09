#Simple Node.js clipboard file transfer

Firstly start listening clipboard process
```
node listenClipboard.js -o ./files/
```

After start sending file
```
node readFile.js -f ./path-to-file.jpg
```