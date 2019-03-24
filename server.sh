#! /bin/sh
if [[ $1 == 'stop' ]]
then
    pkill -9 -f node;
    echo 'server stop';
elif [[ $1 == 'restart' ]] 
then
    pkill -9 -f node;
    node server.js;
    echo 'server restart';
else
    node server.js;
    echo 'server start!';
fi

