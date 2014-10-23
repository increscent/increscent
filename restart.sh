#!/bin/bash
./node_modules/forever/bin/forever stop $1
./node_modules/forever/bin/forever start ./$1
