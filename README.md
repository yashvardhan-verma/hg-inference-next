### install packages using 
```bash
npm install
```
### Setup a python process in upload API
In ```executePythonScript``` function use the correct python env var ilke ```python``` or ```python3``` whatever your system has. This function is promise based so while using it use ```.then``` or change this function to async await and set ```scriptPath``` and  ```args``` according to python file and its command line arguments. 