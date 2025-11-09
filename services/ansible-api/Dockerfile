FROM python:slim

COPY ./requirements.txt /
RUN pip install -r /requirements.txt

ENV USER=ansible
ENV GROUPNAME=$USER
ENV UID=1000
ENV GID=1000

RUN addgroup \
--gid "$GID" \
"$GROUPNAME" \
&&  adduser \
--disabled-password \
--gecos "" \
--home "/home/$USER" \
--ingroup "$GROUPNAME" \
--no-create-home \
--uid "$UID" \
$USER

RUN mkdir -p /home/$USER && chown $USER:$USER /home/$USER

