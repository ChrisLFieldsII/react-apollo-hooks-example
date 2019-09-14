# Description

The main purpose of this repo is getting familiar with using [React Hooks](https://reactjs.org/docs/hooks-intro.html) in combination with the [Apollo GraphQL Client](https://www.apollographql.com/docs/react/) and their use of Hooks.

To give further context, a project I'm working on, I am wanting to replace some logic with hooks but for some reason the `useSubscription()` hook is always stuck loading... So I wanted to test the hooks in a fresh project; and they work!! 🎉🎊

This repo contains examples of:

## Server

GraphQL server powered by [Prisma](https://www.prisma.io/) which includes support for subscriptions out-of-the-box!

So far it just includes queries/mutations/subscriptions for one data type: `User`

There are no APIs used, no auth, so the backend is fairly simple.

[This](https://www.prisma.io/docs/get-started/01-setting-up-prisma-new-database-JAVASCRIPT-a002/) is a great link to learn how to run the server with [Docker and docker-compose](https://docs.docker.com/compose/reference/).

[howtographql.com](https://www.howtographql.com/graphql-js/0-introduction/) is a great reference to learn how to add additional types/functionality to the server

## Web

A web frontend created with [create-react-app](https://create-react-app.dev/)

Web UI [img](web_ui.png)
