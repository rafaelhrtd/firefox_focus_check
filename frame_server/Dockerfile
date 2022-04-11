FROM phusion/baseimage:0.11

ENV LC_CTYPE=C.UTF-8
ENV PYTHONIOENCODING=utf-8:surrogateescape

#comment out all of the source repos, makes apt-get update considerably faster
RUN  sed -i 's/deb-src/#deb-src/g' /etc/apt/sources.list

#install [minimal] dependencies:
RUN apt-get update && \
    apt-get install -yq apt-transport-https less vim psmisc zip unzip wget \
    curl git grep iputils-ping net-tools sudo dnsutils tcptrack && \
    rm -rf /var/lib/apt/lists

RUN apt-get update && apt install ca-certificates
# HACK: this is to work around the root ca that expired on may 30 2020
# Once we upgrade to Ubuntu 18 or later inside our containers, this can be
# removed.
# https://www.reddit.com/r/linux/comments/gshh70/sectigo_root_ca_expiring_may_not_be_handled_well/
RUN sed 's|mozilla\/AddTrust_External_Root.crt|#mozilla\/AddTrust_External_Root.crt|g' -i /etc/ca-certificates.conf
# And this is the same thing to get around the expiry of the root letsencrypt ca
RUN sed 's|mozilla\/DST_Root_CA_X3.crt|#mozilla\/DST_Root_CA_X3.crt|g' -i /etc/ca-certificates.conf
RUN update-ca-certificates -f -v

ENV TERM xterm-256color

ENV NODE_PATH=/usr/local/lib/node_modules:/usr/lib/node_modules

RUN sudo apt-get update -y
RUN sudo apt-get install -y python
ADD externalchat.html /
ADD server.sh /
RUN chmod 755 /server.sh
# EXPOSE 8090:8090
CMD ["./server.sh"]