---
title: "Complete Homelab Setup: From Zero to Production Infrastructure"
date: "2025-01-18"
category: "Projects"
tags: ["Homelab", "Raspberry Pi", "Docker", "DevOps", "Self-Hosting"]
readTime: "25 min read"
featured: true
---

# Complete Homelab Setup: From Zero to Production Infrastructure

I run a homelab with 5 Raspberry Pis providing DNS security, IoT control, media serving, monitoring, and sensor collection. This guide covers everything: hardware selection, network setup, Docker deployments, monitoring, and remote access.

## Why Build a Homelab?

- **Learn infrastructure**: Hands-on experience with real systems
- **Privacy**: Control your own DNS, media, and data
- **Cost savings**: Replace cloud services with self-hosted alternatives
- **Fun projects**: IoT, automation, and experimentation

## Hardware Overview

### My 5-Node Cluster

| Node | Model | Role | RAM | Storage |
|------|-------|------|-----|---------|
| pi-dns | Pi 4 4GB | DNS filtering, Ad blocking | 4GB | 64GB SD |
| pi-media | Pi 4 8GB | Plex, Jellyfin, Downloads | 8GB | 1TB SSD |
| pi-monitor | Pi 4 4GB | Prometheus, Grafana, Alerts | 4GB | 128GB SD |
| pi-iot | Pi 4 2GB | Home Assistant, MQTT, Zigbee | 2GB | 64GB SD |
| pi-sensors | Pi Zero 2W | Temperature, humidity sensors | 512MB | 32GB SD |

### Essential Accessories

- **Network**: Gigabit switch (8-port minimum)
- **Power**: PoE HATs or USB-C power supplies
- **Cooling**: Heatsinks + fans for Pi 4s
- **Cases**: Cluster cases or individual enclosures
- **Storage**: High-endurance microSD cards or SSDs

## Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                           │
└─────────────────────────┬───────────────────────────────┘
                          │
                   ┌──────▼──────┐
                   │   Router    │
                   │ 192.168.1.1 │
                   └──────┬──────┘
                          │
              ┌───────────┼───────────┐
              │     Gigabit Switch    │
              └───────────┼───────────┘
         ┌────────┬───────┼───────┬────────┐
         │        │       │       │        │
    ┌────▼───┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌───▼───┐
    │pi-dns  │ │media│ │monit│ │iot  │ │sensors│
    │.10     │ │.11  │ │.12  │ │.13  │ │.14    │
    └────────┘ └─────┘ └─────┘ └─────┘ └───────┘
```

### Static IP Configuration

Edit `/etc/dhcpcd.conf` on each Pi:

```bash
interface eth0
static ip_address=192.168.1.10/24
static routers=192.168.1.1
static domain_name_servers=1.1.1.1 8.8.8.8
```

## Node 1: DNS Filtering (Pi-hole)

### Installation

```bash
curl -sSL https://install.pi-hole.net | bash
```

### Docker Compose Alternative

```yaml
# docker-compose.yml
version: "3"

services:
  pihole:
    container_name: pihole
    image: pihole/pihole:latest
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "80:80/tcp"
    environment:
      TZ: 'America/Los_Angeles'
      WEBPASSWORD: 'your-secure-password'
    volumes:
      - './etc-pihole:/etc/pihole'
      - './etc-dnsmasq.d:/etc/dnsmasq.d'
    restart: unless-stopped
```

### Router Configuration

Point your router's DNS to the Pi-hole IP (192.168.1.10). All devices on the network now get ad-blocking.

### Custom Blocklists

Add these in Pi-hole's Adlists:

```
https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts
https://raw.githubusercontent.com/crazy-max/WindowsSpyBlocker/master/data/hosts/spy.txt
https://adaway.org/hosts.txt
```

## Node 2: Media Server

### Plex with Hardware Transcoding

```yaml
version: "3"

services:
  plex:
    image: plexinc/pms-docker
    container_name: plex
    network_mode: host
    environment:
      - TZ=America/Los_Angeles
      - PLEX_CLAIM=claim-xxxx
    volumes:
      - /opt/plex/config:/config
      - /mnt/media/tv:/tv
      - /mnt/media/movies:/movies
    devices:
      - /dev/dri:/dev/dri  # Hardware transcoding
    restart: unless-stopped

  jellyfin:
    image: jellyfin/jellyfin
    container_name: jellyfin
    volumes:
      - /opt/jellyfin/config:/config
      - /mnt/media:/media
    ports:
      - 8096:8096
    restart: unless-stopped
```

### External Storage

Mount a USB SSD for media storage:

```bash
# /etc/fstab
UUID=xxxx-xxxx /mnt/media ext4 defaults,noatime 0 2
```

## Node 3: Monitoring Stack

### Prometheus + Grafana

```yaml
version: "3"

services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - 9090:9090
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    container_name: grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - 3000:3000
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secure-password
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter
    container_name: node-exporter
    ports:
      - 9100:9100
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor
    container_name: cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - 8080:8080
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets:
        - 'pi-dns:9100'
        - 'pi-media:9100'
        - 'pi-monitor:9100'
        - 'pi-iot:9100'

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['localhost:8080']

  - job_name: 'pihole'
    static_configs:
      - targets: ['pi-dns:9617']
```

### Grafana Dashboards

Import these dashboard IDs:
- **1860**: Node Exporter Full
- **893**: Docker and Host Monitoring
- **10176**: Pi-hole Exporter

## Node 4: IoT Hub

### Home Assistant

```yaml
version: "3"

services:
  homeassistant:
    container_name: homeassistant
    image: homeassistant/home-assistant:stable
    volumes:
      - /opt/homeassistant:/config
      - /etc/localtime:/etc/localtime:ro
    restart: unless-stopped
    privileged: true
    network_mode: host

  mosquitto:
    image: eclipse-mosquitto
    container_name: mosquitto
    ports:
      - 1883:1883
      - 9001:9001
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log
    restart: unless-stopped

  zigbee2mqtt:
    container_name: zigbee2mqtt
    image: koenkk/zigbee2mqtt
    volumes:
      - ./zigbee2mqtt:/app/data
      - /run/udev:/run/udev:ro
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    environment:
      - TZ=America/Los_Angeles
    restart: unless-stopped
```

### Zigbee Setup

Connect a Zigbee USB coordinator (like Sonoff Zigbee 3.0) and configure:

```yaml
# zigbee2mqtt/configuration.yaml
homeassistant: true
permit_join: true
mqtt:
  base_topic: zigbee2mqtt
  server: mqtt://localhost
serial:
  port: /dev/ttyUSB0
```

## Node 5: Sensor Node

### Python Sensor Script

```python
#!/usr/bin/env python3
import time
import board
import adafruit_dht
import paho.mqtt.client as mqtt

# Initialize DHT22 sensor
dht = adafruit_dht.DHT22(board.D4)

# MQTT client
client = mqtt.Client()
client.connect("pi-iot", 1883)

while True:
    try:
        temperature = dht.temperature
        humidity = dht.humidity

        client.publish("sensors/living_room/temperature", temperature)
        client.publish("sensors/living_room/humidity", humidity)

        print(f"Temp: {temperature}°C, Humidity: {humidity}%")
    except Exception as e:
        print(f"Error: {e}")

    time.sleep(60)
```

### Systemd Service

```ini
# /etc/systemd/system/sensor.service
[Unit]
Description=Temperature/Humidity Sensor
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/sensor.py
WorkingDirectory=/home/pi
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

## Remote Access with Cloudflare Tunnel

### Why Not Port Forwarding?

- No exposed ports
- DDoS protection included
- Free SSL certificates
- Works behind CGNAT

### Setup

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create homelab

# Configure
cat > ~/.cloudflared/config.yml << EOF
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: grafana.mydomain.com
    service: http://localhost:3000
  - hostname: plex.mydomain.com
    service: http://localhost:32400
  - service: http_status:404
EOF

# Run as service
cloudflared service install
```

## Automated Deployments

### Watchtower for Auto-Updates

```yaml
watchtower:
  image: containrrr/watchtower
  container_name: watchtower
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  environment:
    - WATCHTOWER_CLEANUP=true
    - WATCHTOWER_SCHEDULE=0 0 4 * * *  # 4 AM daily
  restart: unless-stopped
```

### Ansible for Configuration Management

```yaml
# playbook.yml
- hosts: pis
  become: yes
  tasks:
    - name: Update system
      apt:
        update_cache: yes
        upgrade: dist

    - name: Install Docker
      apt:
        name:
          - docker.io
          - docker-compose
        state: present

    - name: Start Docker
      service:
        name: docker
        state: started
        enabled: yes
```

## Backup Strategy

### Important Data

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/mnt/backup/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# Docker volumes
docker run --rm -v homelab_prometheus_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/prometheus.tar.gz /data

# Configuration files
tar czf $BACKUP_DIR/configs.tar.gz /opt/*/config

# Sync to remote
rsync -av $BACKUP_DIR user@backup-server:/backups/homelab/
```

### Scheduled Backups

```bash
# /etc/cron.d/homelab-backup
0 2 * * * root /opt/scripts/backup.sh
```

## Power Management

### UPS Integration

With a CyberPower or APC UPS:

```yaml
nut-upsd:
  image: instantlinux/nut-upsd
  container_name: nut
  ports:
    - 3493:3493
  devices:
    - /dev/bus/usb/001/002
  environment:
    - API_USER=upsmon
    - API_PASSWORD=secret
```

### Graceful Shutdown

```bash
# /etc/nut/upsmon.conf
MONITOR myups@localhost 1 upsmon secret master
SHUTDOWNCMD "/sbin/shutdown -h +0"
```

## Cost Analysis

| Component | Cost |
|-----------|------|
| 5x Raspberry Pi 4 | $275 |
| Power supplies | $50 |
| SD cards | $60 |
| 1TB SSD | $80 |
| Gigabit switch | $25 |
| Misc (cables, cases) | $50 |
| **Total** | **~$540** |

### Monthly Savings

| Service | Cloud Cost | Self-Hosted |
|---------|-----------|-------------|
| Pi-hole (DNS) | $5/mo | Free |
| Plex Pass | $5/mo | Free |
| VPN | $10/mo | Free |
| Monitoring | $30/mo | Free |
| **Total Savings** | **$50/mo** | $0 |

ROI: 11 months

## Lessons Learned

1. **Start small**: Begin with one Pi and expand
2. **Use SSDs**: SD cards fail; SSDs are more reliable
3. **Monitor everything**: Prometheus saves debugging time
4. **Document**: Future you will thank present you
5. **Backup**: Test restores regularly

---

*A homelab is never finished—it's a continuous learning platform. Start with one project and grow from there.*
