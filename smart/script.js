const $ = (id) => document.getElementById(id);

let myLocation = null; // { lat, lng }

// LocalStorage helpers
function getDonors() {
  return JSON.parse(localStorage.getItem("donors")) || [];
}
function saveDonors(donors) {
  localStorage.setItem("donors", JSON.stringify(donors));
}
function normalizeText(text) {
  return (text || "").trim().toLowerCase();
}

// ✅ Haversine Distance (KM)
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Render donors
function renderDonors(list) {
  const results = $("results");
  results.innerHTML = "";

  if (!list.length) {
    results.innerHTML = `<p class="small">No donors found 😕</p>`;
    return;
  }

  // Sort by distance if location available
  if (myLocation) {
    list.sort((a, b) => (a._distance || 999999) - (b._distance || 999999));
  }

  list.forEach((d) => {
    const card = document.createElement("div");
    card.className = "result-card";

    let distText = "Distance: Not available";
    if (myLocation && d.lat && d.lng) {
      distText = `📍 ${d._distance.toFixed(2)} km away`;
    }

    card.innerHTML = `
      <div class="result-top">
        <div>
          <strong>${d.name}</strong>
          <div class="small">${d.city}, ${d.area}</div>
          <div class="small">${distText}</div>
        </div>
        <div class="badge">🩸 ${d.bloodGroup}</div>
      </div>

      <div class="status">
        ${d.available === "yes" ? "✅ Available now" : "❌ Not available"}
      </div>

      <div class="result-actions">
        <a class="btn" href="tel:${d.phone}">📞 Call</a>

        <a class="btn" target="_blank"
           href="https://wa.me/91${d.phone}?text=Hi%20${encodeURIComponent(d.name)}%2C%20I%20need%20${encodeURIComponent(d.bloodGroup)}%20blood%20urgently%20at%20${encodeURIComponent(d.area)}%2C%20${encodeURIComponent(d.city)}.">
          💬 WhatsApp
        </a>

        ${
          (d.lat && d.lng)
            ? `<a class="btn" target="_blank"
                 href="https://www.google.com/maps?q=${d.lat},${d.lng}">
                 🗺 Open Map
               </a>`
            : ""
        }

        <button class="btn danger" onclick="deleteDonor(${d.id})">🗑 Delete</button>
      </div>
    `;

    results.appendChild(card);
  });
}

// Delete donor
function deleteDonor(id) {
  const ok = confirm("Delete this donor? ⚠️");
  if (!ok) return;

  let donors = getDonors();
  donors = donors.filter((d) => d.id !== id);

  saveDonors(donors);
  alert("✅ Donor deleted!");

  applyFiltersAndRender();
}

// Apply filters and render
function applyFiltersAndRender() {
  const group = $("searchGroup").value;
  const area = normalizeText($("searchArea").value);
  const availableOnly = $("availableOnly").checked;

  let donors = getDonors();

  donors = donors.filter((d) => {
    const okGroup = group === "" ? true : d.bloodGroup === group;
    const okArea = area === "" ? true : normalizeText(d.area).includes(area);
    const okAvail = availableOnly ? d.available === "yes" : true;
    return okGroup && okArea && okAvail;
  });

  // Calculate distance if possible
  if (myLocation) {
    donors = donors.map((d) => {
      if (d.lat && d.lng) {
        d._distance = distanceKm(myLocation.lat, myLocation.lng, d.lat, d.lng);
      } else {
        d._distance = 999999;
      }
      return d;
    });
  }

  renderDonors(donors.slice().reverse());
}

// Add donor
$("donorForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = $("name").value.trim();
  const bloodGroup = $("bloodGroup").value;
  const phone = $("phone").value.trim();
  const city = $("city").value.trim();
  const area = $("area").value.trim();
  const available = $("available").value;

  const lat = $("lat").value.trim();
  const lng = $("lng").value.trim();

  // Phone validation
  if (!/^[6-9]\d{9}$/.test(phone)) {
    alert("Enter valid 10-digit phone number ✅");
    return;
  }

  const donors = getDonors();

  donors.push({
    id: Date.now(),
    name,
    bloodGroup,
    phone,
    city,
    area,
    available,
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null
  });

  saveDonors(donors);

  $("donorForm").reset();
  $("available").value = "yes";

  alert("✅ Donor Added Successfully!");
  applyFiltersAndRender();
});

// Search & Show all
$("searchBtn").addEventListener("click", applyFiltersAndRender);
$("showAllBtn").addEventListener("click", () => {
  $("searchGroup").value = "";
  $("searchArea").value = "";
  $("availableOnly").checked = false;
  applyFiltersAndRender();
});

// Toggle update instantly
$("availableOnly").addEventListener("change", applyFiltersAndRender);

// Clear all
$("clearAllBtn").addEventListener("click", () => {
  const ok = confirm("⚠️ Delete all donors? This cannot be undone.");
  if (!ok) return;
  localStorage.removeItem("donors");
  renderDonors([]);
  alert("🗑 All donors cleared!");
});

// Get My Location (GPS)
$("getLocationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported on this browser ❌");
    return;
  }

  $("myLocStatus").textContent = "Fetching...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      myLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      $("lat").value = myLocation.lat.toFixed(6);
      $("lng").value = myLocation.lng.toFixed(6);

      $("myLocStatus").textContent = `${myLocation.lat.toFixed(3)}, ${myLocation.lng.toFixed(3)}`;

      alert("✅ Location set! Now distance will show in search.");
      applyFiltersAndRender();
    },
    () => {
      $("myLocStatus").textContent = "Permission denied";
      alert("❌ Location permission denied!");
    }
  );
});

// Emergency button
$("emergencyBtn").addEventListener("click", () => {
  $("availableOnly").checked = true;
  applyFiltersAndRender();
  alert("🚨 Emergency Mode: Showing only available donors!");
});

// On load
window.addEventListener("load", () => {
  renderDonors(getDonors().slice().reverse());
});
