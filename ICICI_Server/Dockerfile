FROM akshay2218/icici-server:0.4

MAINTAINER  Author Name akshay@cateina.com

# Change working directory
WORKDIR "/ICICI_Server"

# Install npm production packages
COPY package.json /ICICI_Server/

RUN cd /ICICI_Server; npm install

COPY . /ICICI_Server

ENV NODE_ENV production
ENV PORT 3002

EXPOSE 3002

RUN apt-get update
RUN apt-get install redis-server
RUN apt-get install mongodb
RUN apt-get -y install supervisor && \
  mkdir -p /var/log/supervisor && \
  mkdir -p /etc/supervisor/conf.d
ADD supervisor.conf /etc/supervisor.conf
CMD ["supervisord", "-c", "/etc/supervisor.conf"]r