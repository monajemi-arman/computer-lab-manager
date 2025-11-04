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

### Technical Architecture
- **MongoDB with Mongoose**: User account storage and management
- **PostgreSQL with Prisma**: Activity logging and audit trails
- **Dual Database Strategy**: Using each database for its strengths - MongoDB for flexible user data, PostgreSQL for structured activity records

## 🚧 Current Status
**Active Development** - Building core synchronization and monitoring features

## 📖 Usage

* **Clone** this repository
* Change **MongoDB password** in `.env` in project baseMongoDB password

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