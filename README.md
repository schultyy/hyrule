# hyrule

View issues offline from a public GitHub repository.

## About

Nowadays at more and more places you have an internet connection. But there are still places where there's no
or just slow connection available. Your source code lives in git, git doesn't require you to be online in order
to make commits/branches/etc. Fine. But the more important part is not offline available nowadays. It's GitHub Issues.
There's no possibility to have them on the local machine without any internet connection. This tool aims to solve that problem.
It requires you only once to have a stable connection in order to copy all open issues into a local PouchDB. Then you're save to pull
the plug and work entirely offline.

## Requirements

- Node 4.2.x

## Installation

```bash
$ npm install -g hyrule
```

## Usage

You need to provide the repository in the username/repository notation.
Then all issues are downloaded and shown in the UI.

```bash
$ hyrule schultyy/avm
```

## Development

Clone this repository.

Then run

```bash
$ npm install
```

to install all dependencies. To start the application run

```bash
$ npm start <username>/<repo>
```
