document.addEventListener('DOMContentLoaded', function() {
  // Modal triggers
  document.getElementById('tosModalTitle').addEventListener('click', function(e) {
    e.preventDefault();
    openModal('tos');
  });

  document.getElementById('privacyModalTitle').addEventListener('click', function(e) {
    e.preventDefault();
    openModal('privacy');
  });

  // Checkbox and button logic
  const termsCheckbox = document.getElementById('terms');
  const termsCheckbox1 = document.getElementById('terms1');
  const loginBtn = document.getElementById('loginBtn');

  termsCheckbox1.addEventListener('change', function() {
    loginBtn.disabled = !this.checked;
  });
  
  termsCheckbox.addEventListener('change', function() {
    loginBtn.disabled = !this.checked;
  });
});

function openModal(type) {  
  const modalId = type === 'tos' ? 'tosModal' : 'privacyModal';
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(type) {
  const modalId = type === 'tos' ? 'tosModal' : 'privacyModal';
  document.getElementById(modalId).style.display = 'none';
}

$(document).ready(function() {
  // on button click
  $('#loginBtn').on('click', function() {
    // console.log('loginBtn clicked');
  }); 

  // verify if the $_GET has location_id, user_id and session_id
  var url = window.location.href;
  var params = url.split('?')[1];
  var params = new URLSearchParams(params);
  console.log(params);
  if(!(params.has('location_id') && params.has('network_id') && params.has('session_id'))) {
    console.log('location_id, network_id, or session_id are not defined');
    // hide the loginBtn, welcome back text and checkbox
    $('#loginBtn').hide();
    // hide the checkbox
    $(".checkbox-wrapper").addClass('hidden');
    // show  this text 
    $('#loginRequestMalformed').removeClass('hidden');
    document.getElementById('login-url').innerHTML = url;
  }
});

// Function to get location_id from URL or sessionStorage
function getLocationId() {
  const params = new URLSearchParams(window.location.search);
  let locationId = params.get("location_id");

  if (locationId) {
    sessionStorage.setItem("location_id", locationId); // Store in session
  } else {
    locationId = sessionStorage.getItem("location_id"); // Retrieve from session if URL doesn't have it
  }

  console.log("Extracted Location ID:", locationId); // Debugging
  return locationId;
}

/**
 * Fetch and display property details using locationId
 * @param {string} locationId
 */
async function fetchPropertyDetails(locationId) {
  if (!locationId) {
    console.error("❌ Location ID is missing.");
    console.log("Location ID is required to fetch property details.");
    return;
  }

  console.log("✅ Fetching Property Details for Location ID:", locationId);

  const apiUrl = `${BRANDING_API}/external/location/${locationId}/branding`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorDetails = await response.json();
        errorMessage = errorDetails.message || errorMessage;
      } catch (jsonError) {
        console.warn("⚠️ Response is not in JSON format.");
      }
      throw new Error(errorMessage);
    }

    const propertyDetails = await response.json();
    console.log("✅ Fetched Property Details:", propertyDetails);
    //console.log("✅ Fetched Property Background Img:", propertyDetails.location.background_img);

    if (!propertyDetails || Object.keys(propertyDetails).length === 0) {
      throw new Error("❌ Received empty property details.");
    }

    renderPropertyDetails(propertyDetails);
  } catch (error) {
    console.error("❌ Error fetching property details:", error);
    //alert(`An error occurred while fetching property details: ${error.message}`);
    renderPropertyDetails({});
  }
}

function renderPropertyDetails(propertyDetails) {
  const body = document.getElementById("body");
  const logoImg = document.getElementById("logo-img");
  const propertyName = document.getElementById("property-name");
  const splashTitle = document.getElementById("splash-title");
  const subtitle = document.getElementById("subtitle");

  if (!body || !splashTitle || !subtitle) {
    console.error("❌ Required elements are missing in the DOM.");
    return;
  }

  const defaultBgColor = "#0f172a";
  if (propertyDetails.location.background_img) {
    const bgImage = new Image();
    bgImage.src = propertyDetails.location.background_img;

    bgImage.onload = () => {
      body.style.backgroundImage = `url('${propertyDetails.location.background_img}')`;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
    };

    bgImage.onerror = () => {
      body.style.backgroundColor = defaultBgColor;
    };
  } else {
    body.style.backgroundColor = defaultBgColor;
  }

  if (logoImg) {
    if (propertyDetails.location.logo_img) {
      logoImg.src = propertyDetails.location.logo_img;
      logoImg.alt = "Property Logo";
    } else {
      logoImg.alt = "Logo not available";
    }
  }

  if (propertyName) {
    propertyName.textContent = propertyDetails.propertyName || "Linkbase";
  }

  splashTitle.textContent = propertyDetails.propertySplashPageTitle || "Connect To The Wifi";
  subtitle.textContent = propertyDetails.location.name || "Welcome to Casa-Loma";

  console.log("✅ Rendered property details successfully.");
}

document.addEventListener("DOMContentLoaded", () => {
  const locationId = getLocationId();
  if (locationId) {
    fetchPropertyDetails(locationId);
  }
});

$("#loginBtn").on('click', function() {
  console.log('loginBtn clicked');
  // collect location_id, user_id and session_id from url and send it to the guest login app's 
  // api where this data will be processed and then send to halowifi api to enable access and 
  // trigger wifi login. HaloWiFi api will respond with a redirection url to which you should redirect 
  // the user to.
  var url = window.location.href;
  var params = url.split('?')[1];
  var params = new URLSearchParams(params);
  var location_id = params.get('location_id');
  // var user_id = params.get('user_id');
  var session_id = params.get('session_id');
  // var login_app_id = params.get('login_app_id');
  var login_app_id = LOGIN_APP_ID; // Login APP Id Coming  from config.js file

  var login_data = {
    location_id: location_id,
    network_id: params.get('network_id'),
    session_id: session_id,
    login_app_id: login_app_id
  };

  var guest_login_api_url = APP_API+'/connect/external/trigger-login';

  $.ajax({
    url: guest_login_api_url,
    method: 'POST',
    data: login_data,
    success: async function(response) {
      console.log(response);
      await handleUserConnect();
      
      // window.location.href = response.redirect_url

    },
    error: function(error) {
      console.log("Error in triggering login:: ", error);
      // alert("Error in triggering login:: "+error);
    }
  });
});


// Method to handle user connection and save data offline if no internet
async function handleUserConnect() {
  debugger;
  const guestFullName = document.getElementById("guestFullName").value.trim();
  const guestPhoneNo = document.getElementById("guestPhoneNo").value.trim();
  const guestEmailId = document.getElementById("guestEmailId").value.trim();

  // Extract location_id & network_id from the URL
  const params = new URLSearchParams(window.location.search);
  const location_id = params.get('location_id');
  const network_id = params.get('network_id');

  // Create a data object to send to the API
  const requestData = {
    guestFullName: guestFullName,    
    guestPhoneNo: guestPhoneNo,      
    guestEmailId: guestEmailId,      
    propertyLocationId: location_id,   
    propertyNetworkId: network_id,   
  };

  // API URL
  const apiUrl = GUEST_POST_API + '/guest-details';

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });


    // log raw response or parsed data
    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! Status: ${response.status}`);
    }

    console.log(window.location.href = response.redirect_url);

    window.location.href = response.redirect_url;

    // Clear input fields after successful submission
    document.getElementById("guestFullName").value = "";
    document.getElementById("guestPhoneNo").value = "";
    document.getElementById("guestEmailId").value = "";

  } catch (error) {
    console.error("Error occurred:", error.message);
    alert("Something went wrong. Please try again.");
  }
}
