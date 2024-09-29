安装脚本需要的依赖  
pip install -r requirements.txt
运行脚本   python3 main.py
后台运行 nohup python3 -u main.py 
结束    ps -ef|grep main.py    kill -9  15656(对应的id号)
