# Ecommerce-Microservice-App

This repository contains code to implement and deploy e-commerce microservices to a Kubernetes Minikube cluster. The goal of this readme is to show how to deploy microservices contained in this repo to a minikube cluster. 

## Ecommerce app architecture
![shop app architecture](/images/app_architecture.png)

<!-- Add a blank line here -->
## Prerequisites
The following are prerequisites to completing the steps in this microservice deployment:

### Install node in your environment and add it to path. 
You can find the installation steps [here](https://nodejs.org/en/download/package-manager). 

### Package the application 
Use docker to build image for each microservice and upload it to an image registry such as dockerhub. 

### set up kubernetes minikube cluster on your local machine
- Install a hypervisor such as hyper-v, virtualbox etc
- Install minikube 
- Install kubectl a command line for accessing the minikube. 

Step by step guide on how to go about these installations can be found in the [official kubernetes documentation page](https://kubernetes.io/docs/tasks/tools/). 

<!-- Add a blank line here -->
## Deployment
To deploy the manifests, follow the below sequence to ensure smooth deployment.

1. Deploy [MySQL manifests](/catalogue/mysql/manifests) files since its essential for the entire application and operates independently of any microservice
2. Deploy [catalogue manifests](/catalogue/catalogue/manifests) and confirm it communicates successfully with the MySQL database using "/getTestProducts" endpoint. 
3. Deploy [cart manifests](/cart/manifests). This ensures the carts configmap is already deployed before deploying the frontend manifest which requires information from both the cart and catalogue configmaps. 
4. Finally deploy the [frontend manifest](/front-end/manifests). 


## Running Application
If the deployment is successful, you would see a running app as shown below. 
<!-- Add a blank line here -->
![deployed Ecommerce App](/images/running_app.png)