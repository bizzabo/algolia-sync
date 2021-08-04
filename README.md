# algolia-sync

## Description
This repo is needed for managing the Algolia search which is used in web-dashboard. The data is stored in a google spreadsheet (the link is below). These scripts are needed because you are not able to make changes via algolia UI. To have access to the algolia account ask the IT director to give you access to the Algolia credentials via LastPass. The flow for update data is: update spreadsheets -> clone repo -> `npm i` -> `npm run sync`.

## Configure

Get the `.env`-file with credentials, try Iryna, Eran G, or Royi

## Read from the Spreadsheet to JSON to `stdout`
[This is the spreadsheet we use for Algolia](https://docs.google.com/spreadsheets/d/1kbldcLdvljR-Bi8mynecmOTolV53GhFhB6HzSA88PUE/edit#gid=0)
```
npm run read
```

## Write JSON from `stdin` to Search Index

```
npm run write
```

## Read & Write

```
npm run sync
```
