# Nûkhudro Nab

Discord music bot that plays music from nextcloud. If you want a nextcloud music bot for discord ... this is the place. (Except not because this is WIP af)

Repo name might or might not be in Horngoth.

# Installing

## Prerequisites

* Node:
* npm: 

You're also hopefully using a decent operating system. For all the people using Windows and MacOS, that means any modern Linux distribution (but you don't
need to go all the way to [btwOS](https://m4gnus.de/arch/)).

I'm using Manjaro and a LXC container running either:

* Debian
* Ubuntu (less likely)

Everything else is untested.

## Installation

```bash
git clone [this repo]
cd [folder]
npm ci
```

Create file `env/config.json`. Pasterino this:

```json
{
  "prefix": "musictl",
  "token": "YOUR_API_KEY_GOES_HERE"
}
```