var bedIndex = 0;

$('#editBedModal').on('show.bs.modal', function() {
  $('#spinnerAddBeds').show();
  $('#bedList').hide();
  $.ajax({
    url: '/service/dashboard/' + $('#uri').text() + '/beds/show',
    method: 'GET',
    success: function(data) {
      for (bed of data.service.beds) {
        $('#bedList').append(BedPanel({
          index: bedIndex,
          name: bed.name,
        }));
        $('#bedGender'.concat(bedIndex)).val(bed.gender);
        $('#bedType'.concat(bedIndex)).val(bed.bedType);
        bedIndex++;
      }
      $('#spinnerAddBeds').hide();
      $('#bedList').slideDown(500);
    },
  });
});

$('#editBedModal').on('hidden.bs.modal', function() {
  $('#bedList').html('');
  bedIndex = 0;
})

$('#addBed').click(function() {
  $('#bedList').append(BedPanel({ index: bedIndex++, name: "" }));
})

$('#bedList').on('click', '[href="Remove Bed"]', function(event) {
  event.preventDefault();
  $(this).closest('div.panel.shadow').remove();
})

$('#bedForm').submit(function( event ) {
  event.preventDefault();
  const submit_button = $(this).find(':submit');
  const spinner = $(this).find('#spinnerConfirmBeds');
  submit_button.hide(100);
  spinner.show(100);

  const post_url = $(this).attr("action"); //get form action url
  const request_method = $(this).attr("method"); //get form GET/POST method
  const form_data = $(this).serialize(); //Encode form elements for submission

  $.ajax({
    url : post_url,
    type: request_method,
    data : form_data,
  }).done(function(response) {
    spinner.hide();
    submit_button.show();
    $('#editBedModal').modal('hide');
    updateBeds();
    return;
  });
})

const BedPanel = ({ index, name }) => `
  <div class="panel shadow">
    <div class="panel-body">
      <div class="row text-center">
        <div class="col-sm-3 col-xs-6">
          <input type="text" name="beds[${index}][name]" id="bedName${index}" value="${name}" required placeholder="Bed Name" class="form-control"/>
        </div>
        <div class="col-sm-3 col-xs-6">
          <select name="beds[${index}][gender]" id="bedGender${index}" required class="form-control">
            <option hidden='true'>Gender</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='Either'>Either</option>
          </select>
        </div>
        <div class="col-sm-3 col-xs-6">
          <select name="beds[${index}][bedType]" id="bedType${index}" required class="form-control">
            <option hidden='true'>Bed Type</option>
            <option value='Single'>Single</option>
            <option value='ParentChild'>Parent with Child</option>
          </select>
        </div>
        <div class="col-sm-3 col-xs-6">
          <a href="Remove Bed" class="btn btn-danger btn-block">
             Remove Bed
          </a>
        </div>
      </div>
    </div>
  </div>
`;



/**
 *  TODO: COMMENT
 */
$(document).ready(function() {
  updateBeds();

  updateRequests();
});

/**
 *  When the user clicks the Bed Management tab
 */
$('a[href="#bedManagement"]').on('click', function() {
  updateBeds();

  updateRequests();
});

function updateBeds() {
  $('#updateBeds > .form-group').html('');
  $('#updateBeds > .form-group').hide();
  $('#spinnerLoadBeds').show();
  $.get('/service/dashboard/' + $('#uri').text() + '/beds/show', function(data) {
    let index = 0;
    for (bed of data.service.beds) {
      $('#updateBeds > .form-group').append(UpdatePanel({
        index,
        name: bed.name
      }));
      $('#avaliable'+index).prop('checked', bed.isOccupied === 'Available');
      $('#pending'+index).prop('checked', bed.isOccupied === 'Pending');
      $('#unavailable'+index).prop('checked', bed.isOccupied === 'Unavailable');
      index++;
    }
    $('#spinnerLoadBeds').hide();
    $('#updateBeds > .form-group').slideDown(500);
  });
}

$('#updateBeds').submit(function(event) {
  event.preventDefault();
  const submit_button = $(this).find(':submit');
  const spinner = $(this).find('#spinnerUpdateBeds');

  submit_button.hide();
  spinner.show();

  const post_url = $(this).attr("action"); //get form action url
  const request_method = $(this).attr("method"); //get form GET/POST method
  const form_data = $(this).serialize(); //Encode form elements for submission

  $.ajax({
    url : post_url,
    type: request_method,
    data : form_data,
  }).done(function(response) {
    spinner.hide();
    submit_button.show();
    return;
  });
});

function updateRequests() {
  $('#updateRequests > .form-group').html('');
  $('#updateRequests > .form-group').hide();
  $('#spinnerLoadRequests').show();
  $.get('/service/dashboard/' + $('#uri').text() + '/requests/show', function(data) {
    let index = 0;
    for (request of data.requests) {
      $('#updateRequests > .form-group').append(RequestPanel({
        index,
        name: request.firstName + ' ' + request.lastName,
        email: request.email,
        number: request.phoneNumber,
        age: getAge(request.dob),
        id: request._id,
      }));
      index++;
    }
    $('#spinnerLoadRequests').hide();
    $('#updateRequests > .form-group').slideDown(500);
  });

  $('#closedRequests > .form-group').html('');
  $('#closedRequests > .form-group').hide();
  $('#spinnerLoadRequestsClosed').show();
  $.get('/service/dashboard/' + $('#uri').text() + '/closed_requests/show', function(data) {
    let index = 0;
    for (request of data.requests) {
      $('#closedRequests > .form-group').append(ClosedRequestPanel({
        index,
        name: request.firstName + ' ' + request.lastName,
        email: request.email,
        number: request.phoneNumber,
        age: getAge(request.dob),
      }));
      index++;
    }
    $('#spinnerLoadRequestsClosed').hide();
    $('#closedRequests > .form-group').slideDown(500);
  });
}

$('#updateRequests').submit(function(event) {
  event.preventDefault();
  const submit_button = $(this).find(':submit');
  const spinner = $(this).find('#spinnerUpdateRequests');

  submit_button.hide();
  spinner.show();

  const post_url = $(this).attr("action"); //get form action url
  const request_method = $(this).attr("method"); //get form GET/POST method
  const form_data = $(this).serialize(); //Encode form elements for submission

  $.ajax({
    url : post_url,
    type: request_method,
    data : form_data,
  }).done(function(response) {
    spinner.hide();
    submit_button.show();
    updateRequests();
    return;
  });
});

function getAge(date) {
  const today = Date.now();
  const age = new Date(today - new Date(date).getTime());
  return Math.abs(age.getUTCFullYear() - 1970);
}

const UpdatePanel = ({ index, name }) => `
  <div class="panel shadow">
    <div class="panel-body">
      <div class="row text-center">
        <div class="col-xs-2">
          <h4>ICON</h4>
        </div>
        <div class="col-xs-4">
          <h4>${name}</h4>
        </div>
        <div class="col-xs-2">
          <h6>Avaliable</h6>
          <input type="radio" name="beds[${index}][isOccupied]" value="Available" id='avaliable${index}' />
        </div>
        <div class="col-xs-2">
          <h6>Pending</h6>
          <input type="radio" name="beds[${index}][isOccupied]" value="Pending" id='pending${index}' />
        </div>
        <div class="col-xs-2">
          <h6>Occupied</h6>
          <input type="radio" name="beds[${index}][isOccupied]" value="Unavailable" id='unavailable${index}' />
        </div>
      </div>
    </div>
  </div>
`;

const RequestPanel = ({ index, name, email, number, age, id }) => `
  <div class="panel shadow">
    <div class="panel-body">
      <div class="row text-center">
        <div class="col-xs-2">
          <h4>ICON</h4>
        </div>
        <div class="col-xs-3">
          <h6>${email}</h6>
          <h6>${number}</h6>
        </div>
        <div class="col-xs-3">
          <h4>${name}</h4>
        </div>
        <div class="col-xs-2">
          <h6>${age}</h6>
        </div>
        <div class="col-xs-2">
          <input type="checkbox" name='requests[${index}]' value='${id}' />
        </div>
      </div>
    </div>
  </div>
`;

const ClosedRequestPanel = ({ index, name, email, number, age }) => `
  <div class="panel shadow">
    <div class="panel-body">
      <div class="row text-center">
        <div class="col-xs-2">
          <h4>ICON</h4>
        </div>
        <div class="col-xs-3">
          <h6>${email}</h6>
          <h6>${number}</h6>
        </div>
        <div class="col-xs-3">
          <h4>${name}</h4>
        </div>
        <div class="col-xs-2">
          <h6>${age}</h6>
        </div>
      </div>
    </div>
  </div>
`;

/**
 *  When the user clicks the Service Profile tab
 */
$('a[href="#serviceProfile"]').on('click', function() {
  $('#addServiceForm').hide();
  $('#spinnerLoadProfile').show();
  $.get('/service/dashboard/' + $('#uri').text() + '/profile', function(data) {

    $('#serveName').val(data.service.name);
    $('#serveType').val(data.service.serviceType);

    $('#serveSuburb').val(data.service.address.suburb);
    $('#serveState').val(data.service.address.state);
    $('#servePostcode').val(data.service.address.postcode);

    $('#serveMinAge').val(data.service.ageRange.minAge);
    $('#serveMaxAge').val(data.service.ageRange.maxAge);
    $('#serveStayLength').val(data.service.stayLength);

    $('#serveEmail').val(data.email);
    $('#servePhone').val(data.service.phoneNumber);

    $('#serveDesc').val(data.service.description);
    $('#serveAbout').val(data.service.about);
    $('#serveRules').val(data.service.houseRules);

    let $inputs = $('#serveAmenitiesForm :input');

    $inputs.each(function() {
      for (amen of data.service.amenities) {
        if (amen.name === this.id) {
          $(this).prop('checked', true);
        }
      }
    });
    $('#spinnerLoadProfile').hide();
    $('#addServiceForm').slideDown(1000);
  });

  $.get('/service/dashboard/' + $('#uri').text() + '/images', function(data) {
    // console.log(data);
    // console.log(data.data.images);
    // console.log(data.data.logo);
    // console.log(insertPhotos($('#uri').text(), data.data.logo, data.data.images));
    $('#photoUploadRow').append(
      insertPhotos($('#uri').text(), data.data.logo, data.data.images)
    );
    setImageListeners();
    $('#loadingPhotoUploadRow').fadeOut(400, function() {
      $('#photoUploadRow').slideDown(1000);
    });
  });
});

function insertPhotos(uri, logo, images) {
  return  "<div class='alert alert-danger' id='alertBox' style='display: none;'></div>" +
          "<label for='logoRow'>LOGO</label>" +
          "<div class='row' id='logorow'>" +
            insertLogoModal(logo) +
            "<div class='item col-xs-6'>" +
              "<form action='/service/profile/" + uri + "/logo/add' method='post' enctype='multipart/form-data'>" +
                "<div class='thumbnail'>" +
                  "<div class='image highlight' style='line-height: 0px;'>" +
                    insertLogo(logo) +
                  "</div>" +
                "</div>" +
              "</form>" +
            "</div>" +
          "</div>" +
          "<label for='imageRow'>PHOTOS</label>" +
            "<div class='row' id='imagerow'>" +
              insertImage(uri, images) +
            "</div>";
}

function insertLogoModal(logo) {
    return "<div class='modal fade' id='deletelogomodal' role='dialog'>" +
              "<div class='modal-dialog modal-sm'>" +
                "<div class='modal-content'>" +
                    "<div class='modal-header'><button class='close' type='button' data-dismiss='modal'>&times;</button>" +
                        "<h3>Delete this logo?</h3>" +
                    "</div>" +
                    "<div class='modal-header text-center'>" +
                        "<div class='image'><img class='img img-responsive' id='deleteLogoImg' src='" + logo + "' /></div>" +
                    "</div>" +
                    "<div class='modal-body text-center'>" +
                        "<div class='btn btn-danger' id='deletelogobutton' onclick='deleteLogo()'>Delete</div>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>";
}

function insertLogo(logo) {
  let visibility = "";
  logolabel = "<label id='logoLabel' style='margin: 0px; display: none;'>";
  if (logo == null) {
    visibility = " style='display: none;'";
    logolabel = "<label id='logoLabel' style='margin: 0px;'>"
  }
  return  "<a id='logoLink'" + visibility + " href='#' data-toggle='modal' data-target='#deletelogomodal'>" +
            "<img class='img-responsive' id='logoImg' src='" + logo + "'/>" +
          "</a>" +
          logolabel +
            "<img class='img-responsive' id='plusLogo-img' src='/images/plus.png' alt='Add Image' style='cursor: pointer;'/>" +
            "<img class='img-responsive' id='spinnerLogo-gif' src='/images/loading_spinner.gif' style='display: none;'/>" +
            "<input id='logoAdd' type='file' accept='image/*' hidden='' name='logoAdd' onchange='event.preventDefault();'/>" +
          "</label>";
}

function insertImageModal(img, index) {
  return  "<div class='modal fade' id='deleteimagemodal-image" + index + "' role='dialog'>" +
            "<div class='modal-dialog modal-sm'>" +
                "<div class='modal-content'>" +
                    "<div class='modal-header'><button class='close' type='button' data-dismiss='modal'>&times;</button>" +
                        "<h3>Delete this image?</h3>" +
                    "</div>" +
                    "<div class='modal-header text-center'>" +
                        "<div class='image'><img class='img img-responsive' id='deleteImg" + index + "' src='" + img + "' /></div>" +
                    "</div>" +
                    "<div class='modal-body text-center'>" +
                        "<div class='btn btn-danger' id='deleteimagebutton-image" + index + "' onclick='deleteImage(" + index + ")'>Delete</div>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>";
}

function insertImageThumbnail(image, index, isHidden) {
  column = "<div class='item col-xs-4' style='padding-top: 5px; padding-bottom: 5px;' id='item" + index + "'>";
  if (isHidden) {
    column = "<div class='item col-xs-4' style='display: none;' id='item" + index + "'>"
  }
  return  insertImageModal(image, index) +
          column +
            "<div class='thumbnail'>" +
              "<div class='image highlight'>" +
                "<a href='#' id='imagethumbnailmodal" + index + "' data-toggle='modal' data-target='#deleteimagemodal-image" + index + "'>" +
                  "<img class='img-responsive' src='" + image + "' id='img" + index + "'/>" +
                "</a>" +
              "</div>" +
            "</div>" +
          "</div>";
}

function insertImageAdd(uri) {
  return  "<div class='item col-xs-4' id='itemAdd'>" +
            "<form action='/service/profile/" + uri + "/add' method='post' enctype='multipart/form-data'>" +
                "<div class='thumbnail'>" +
                    "<div class='image highlight' style='line-height: 0px; border: 0px;'>" +
                      "<label style='margin: 0px;'>" +
                          "<img class='img-responsive' id='plus-img' src='/images/plus.png' alt='Add Image' style='cursor: pointer;'/>" +
                          "<img class='img-responsive' id='spinner-gif' src='/images/loading_spinner.gif' style='display: none;'/>" +
                          "<input id='fileAdd' type='file' accept='image/*' hidden='' name='fileAdd' onchange='event.preventDefault();'/>" +
                      "</label>" +
                    "</div>" +
                "</div>" +
            "</form>" +
          "</div>";
}

function insertImage(uri, images) {
  if (images != null && images.length > 0) {
    result = "";
    if (length <= 5) {
      result += insertImageAdd(uri);
    }

    for (let index = 0; index < 6; index += 1) {
      if (index < images.length) {
        result += insertImageThumbnail(images[index], index, false);
      }
      else {
        result += insertImageThumbnail('', index, true);
      }
    }
    return result;
  } else {
    thumbnails = "";
    for (let index = 0; index < 6; index += 1) {
      thumbnails += insertImageThumbnail('', index, true);
    }
    return  "<div class='item col-xs-4'></div>" +
            insertImageAdd(uri) +
            thumbnails;
  }
}

/**
 *  When the user clicks the Beds Available tab
 */
$('a[href="#bedsAvaliable"]').on('click', function() {
  console.log('What a meme');
});
