FROM akshay2218/icici-server:0.4
#CMD ["npm", "start"]
RUN apt-get -y install supervisor && \
  mkdir -p /var/log/supervisor && \
  mkdir -p /etc/supervisor/conf.d
MAINTAINER  Author Name akshay@cateina.com
# Change working directory
RUN rm -rf /ICICI_Server
WORKDIR "/ICICI_Server"
# Install npm production packages
#COPY ICICI_Server/package.json /ICICI_Server/
ADD ICICI_Server/supervisor.conf /etc/supervisor.conf
COPY ICICI_Server/ /ICICI_Server
RUN cd /ICICI_Server
RUN echo "test"
RUN npm install
ENV NODE_ENV production
ENV PORT 3002
EXPOSE 3002
EXPOSE 3001

CMD ["supervisord", "-c", "/etc/supervisor.conf"]
#CMD ["npm", "start"]
