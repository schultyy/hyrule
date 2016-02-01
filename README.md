# hyrule

[![Build Status](https://travis-ci.org/schultyy/hyrule.svg?branch=master)](https://travis-ci.org/schultyy/hyrule)

View issues offline from a public GitHub repository.

## About

Nowadays, more and more places have an internet connection, but there are still places where there's either no connection
or it is really slow. Your source code lives in git, and git doesn't require you to be online in order
to make commits/branches/etc. That's fine. But a more important part is not available offline. It's GitHub Issues.
There's no possibility to have them on your local machine without an internet connection. This tool aims to solve that problem.
The tool requires you to only have a stable connection once in order to copy all open issues into a local PouchDB instance. Then you're safe to pull
the plug and work entirely offline.

## Requirements

- Node 4.2.x

## Installation

```bash
$ npm install -g hyrule
```

## Usage

You need to provide the repository in the username/repository notation.
Then all the issues are downloaded and shown in the UI.

(here we are getting all issues from [schultyy/avm](https://github.com/schultyy/avm))

```bash
$ hyrule schultyy/avm
```

## Development

1. Clone this repository

Then, in your terminal, run

```bash
$ npm install
```

After that is finished, run

```bash
$ npm link
```

Then you're able to start the app by running

```bash
$ hyrule
```
