docker build --build-arg HTTP_PROXY=http://localhost:7897 -f Dockerfile -t 192.168.1.25:5000/sgs/dify-api:1.5.0 --push .
docker build --platform linux/arm64 --build-arg HTTP_PROXY=http://localhost:7897 -f Dockerfile -t 192.168.1.25:5000/sgs/arm64v8/dify-api:1.5.0 --push .
