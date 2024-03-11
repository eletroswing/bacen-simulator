# FORK
First of all, fork the project on your github (click on the star 🌟)

# CLONE
Before starting, make sure to git clone, you can follow the steps below to create a clone and switch branches:

```sh
git clone https://github.com/eletroswing/bacen-simulator BacenSimulator
cd BacenSimulator
git checkout -b your-branch-name
```

# The dependecies
There are two ways you can proceed, use:
```sh
npm i
```
to install the updated modules, or:
```sh
npm ci
```
to install from package-lock!

# The migrations
To run the migrations there are a few commands before starting using. They are:
```sh
npm run migration:run
```
To create tables, and: 
```sh
npm run migration:seed
```
To insert some testing values on db. To run both of them at the same time, run:
```sh 
npm run migration
```

# Running the project
We use turbo to manage all apps.
To start the project, you can run on your terminal:
```sh
npm run start
```
Or, if you are developing, run:
```sh
npm run dev
```

# Tests
We provide a bunch of tests E2E to our systems, aimming on the developer expierence. The developer can run all tests when needed(developing the repo, or not):
```sh
npm run test
```
Or:
```sh
npm run test:watch
```

# Making the commit
To avoid straying too far from the commit structure, when you finish your changes, use the command to add (`git add`) followed by (remember to run the installation of dependencies):

```sh
npm run commit
```
Just follow commitzen's steps to make your message look beautiful. And then, continue with the push to your fork branch!
