import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
@Component({
  selector: 'app-asset-map',
  standalone: true,
  imports: [],
  templateUrl: './asset-map.component.html',
  styleUrl: './asset-map.component.css'
})
export class AssetMapComponent implements AfterViewInit {
  private map: any;

  private assets = [
    {
      lat: 26.233,
      lon: 50.580,
      price: 1000000,
      title: "Bahrain World Trade Center",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Bahrain_WTC.jpg",
      location: "Manama"
    },
    {
      lat: 26.215,
      lon: 50.583,
      price: 550000,
      title: "Luxury Villa",
      image: "https://via.placeholder.com/200x100",
      location: "Budaiya"
    },
    {
      lat: 26.245,
      lon: 50.577,
      price: 250000,
      title: "Downtown Apartment",
      image: "https://via.placeholder.com/200x100?text=Apartment",
      location: "Sanabis"
    }
  ];

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([26.22, 50.58], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.assets.forEach(asset => {
      const icon = L.divIcon({
        className: 'price-marker',
        html: `<div class="price-label">BHD ${asset.price.toLocaleString()}</div>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15]
      });

      const marker = L.marker([asset.lat, asset.lon], { icon }).addTo(this.map);

      marker.on('click', () => {
        marker.bindPopup(this.generatePopup(asset)).openPopup();
      });

      marker.on('mouseover', () => {
        marker.bindPopup(this.generatePopup(asset)).openPopup();
      });
    });
  }

  private generatePopup(asset: any): string {
    return `
      <div style="width: 220px; font-family: sans-serif;">
        <h4 style="margin: 0 0 5px;">${asset.title}</h4>
        <img src="${asset.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px;" />
        <p style="margin: 5px 0; font-size: 14px;">
          <strong>Price:</strong> BHD ${asset.price.toLocaleString()}<br>
          <strong>Location:</strong> ${asset.location}
        </p>
        <button style="padding: 6px 10px; background-color: #2d89ef; color: white; border: none; border-radius: 4px; cursor: pointer;">
          View Details
        </button>
      </div>
    `;
  }
}

