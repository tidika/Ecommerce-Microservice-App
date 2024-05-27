# Ecommerce-Microservice-App

This repository contains code to implement and deploy e-commerce microservices to a Kubernetes Minikube cluster. The goal of this readme is to show how to deploy microservices contained in this repo to a minikube cluster. 

## Ecommerce app architecture
![shop app architecture](/app_architecture.jpg)


## Prerequisites
The followings are prerequisites to completing the steps in this microservice deployment:

### Install node in your environment and add it to path. 
You can find the installation steps [here](https://nodejs.org/en/download/package-manager). 

### Package the application 
Use docker to build image for each microservice and upload it to an image registry such as dockerhub. 

### set up kubernetes minikube cluster on your local machine
- Install a hypervisor such as hyper-v, virtualbox etc
- Install minikube 
- Install kubectl a command line for accessing the minikube. 

Step by step guide on how to go about these installations can be found in the [official kubernetes documentation page](https://kubernetes.io/docs/tasks/tools/). 


## Deployment
