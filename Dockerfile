FROM node:6.9.1
MAINTAINER Charles Pascoe

# Convert build argument to environment variable
ARG VERSION=0.0.0-DEV
ENV VERSION=$VERSION
ENV NODE_ENV=production

# Create user
ENV USERNAME app
RUN useradd --user-group --create-home --shell /bin/false $USERNAME
ENV HOME=/home/$USERNAME

# Create server directory
ENV APP_DIR=$HOME/proj-mgmt-sys/
RUN mkdir -p $APP_DIR
WORKDIR $APP_DIR

# Config path
ENV CONFIG_PATH=/etc/config.json

# Create log directory
ENV LOG_DIR=/var/log/app/
RUN mkdir -p $LOG_DIR
RUN chown -R $USERNAME:$USERNAME $LOG_DIR

# Import server source
COPY docker-build/ .

# Setup node modules
RUN npm install

# Set user as owner of all in HOME
RUN chown -R $USERNAME:$USERNAME $HOME

# Export port
EXPOSE 8080

# Switch to user
USER $USERNAME

# Add server directory to NODE_PATH for requiring modules
ENV NODE_PATH=$APP_DIR:$NODE_PATH

CMD node server/index.js | node_modules/bunyan/bin/bunyan
