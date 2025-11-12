# Computer Lab Manager

## Overview

![](./public/screenshot.png)

Computer Lab Manager is an orchestration system designed to manage university computer labs and clusters. It solves the practical challenges of maintaining multiple systems while providing centralized control for synchronization, updates, and monitoring.

## 🎯 The Problem

Managing our university's computer lab involves:
- Manually synchronizing user accounts across 20+ workstations
- Coordinating system updates without disrupting lab sessions
- Monitoring hardware health and storage space across all machines
- Maintaining consistent software configurations
- Providing remote access for maintenance and support
- Balancing computational workloads efficiently

## 🛠 The Solution

### Core Features
- **Centralized User Management**: Synchronize user accounts across all lab computers
- **Automated System Updates**: Coordinate apt updates with centralized caching
- **Remote Access Control**: SSH management and RustDesk remote desktop deployment
- **Infrastructure as Code**: Terraform-based provisioning for Kubernetes clusters
- **Real-time Monitoring**: Prometheus and Grafana for system health and metrics
- **Configuration Management**: Ansible playbooks for consistent system setup

## 🚧 Current Status
**Active Development** - Building core synchronization and monitoring features

## 📖 Usage

### Production
* **Clone** this repository. Go to the directory.
* Run `node create-env.js` to setup the environment.
* Run `docker compose up` to start the app. Visit http://localhost

### Development
This is only if you want to work on the code and develop the project.  
* **Clone** this repository. Go to the directory.
* Run `node create-env.js` to setup the environment.
* Run `docker compose up mongo` in project base if you don't have a MongoDB server.
* Install project required node modules by running `npm install`.
* Running `npm run dev` will start the app and its services.


## 🔮 Future Roadmap

### Sparkling Integration
Integration with our existing [Sparkling](https://github.com/monajemi-arman/sparkling) project to enable:
- Automated GPU-enabled Spark cluster deployment
- Distributed AI training environment management
- GPU resource allocation and monitoring for machine learning workloads

## 💡 Learning Aspect

*While this project addresses real operational needs, it also serves as a platform for exploring modern DevOps tools and practices that are valuable in today's infrastructure landscape.*

---

*Solving real lab management challenges with modern infrastructure tools*