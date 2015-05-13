function addTrackToPlayList() {
  var $addBtns = $('.add-btn');
  $addBtns.on('click', function(ev){
    li = $(this).closest('li').clone();
    li.find('.song-delete').html('<div class="delete-btn"><i class="fa fa-times"></i></div>');
    li.find('.delete-btn').on('click', deleteTrack);
    $('.playlist ol#sortable').append(li);
    toggleDisplay($('.playlist'), $('.search-results'));
    toggleDisplay($('.title h1.playlist'), $('.title h1.search'));
    updateTrackStats();
  });
};

function updateTrackStats() {
  addUpTracks();
  calcCoolFactor();
  totalPlaylistTime();
  updateLocalStorage();
};

function updateLocalStorage() {
  var playListName = $('.title h1.playlist .playlist-name').text(),
      playListSongData = $(".playlist ol").html(),
      playListTags = $('.tags span').text();

  if (playListName === 'Search Results') {
    return;
  } else {
    localStorage.clear();
    localStorage['playListName'] = playListName;
    localStorage['playListSongData'] = playListSongData;
    localStorage['playListTags'] = playListTags;
  }
};

function toggleDisplay(elemShow, elemHide) {
  elemHide.css('display', 'none');
  elemShow.css('display','block');
};

function getItemsFromStorage() {
  var playListName = localStorage['playListName'];
  if (localStorage['playListName']) {
    $('.title h1.playlist .playlist-name').text(playListName);
    $('.playlist ol').html(localStorage['playListSongData']);
    $('.tags span').text(localStorage['playListTags']);
  }
  changePlayListName();
};

function addUpTracks() {
  var totalTracksInput = $('#total-tracks');
  var totalTracks = $('.songs.playlist #sortable li');
  $("#sortable").sortable( "destroy" );
  $("#sortable").sortable({
     dropOnEmpty: false,
     disabled: false,
     items: 'li',
     delay: 150
  });
  var trackHtml = totalTracks.length === 1 ? '1 track' : totalTracks.length + ' tracks';
  totalTracksInput.html(trackHtml);
};

function calcCoolFactor() {
  var totalTracks = $('.songs.playlist #sortable li');
  var coolFactor = 0;
  for (var i = 0; i < totalTracks.length; i++) {
    coolFactor += parseInt($(totalTracks[i]).find('.song-popularity').html());
  }
  if (coolFactor > 0) {
    coolFactor = Math.round(coolFactor/totalTracks.length);
  }
  $('.total-cool').html(coolFactor);
};

function totalPlaylistTime(){
  var totalTracks = $('.songs.playlist #sortable li');
  var totalTracksTime = 0;
  for (var i = 0; i < totalTracks.length; i++) {
    totalTracksTime += convertToMS($(totalTracks[i]).find('.song-duration').html());
  }
  if (totalTracksTime > 0) {
    totalTracksTime = msToMinutesAndSeconds(totalTracksTime);
  }
  $('.total-duration').html(totalTracksTime);
};

function deleteTrack() {
  $(this).closest('li').remove();
  updateTrackStats();
};

function autoCompleteDisplay(results) {
  results.forEach(function(result){
    var option = document.createElement('option');
    option.value = result['name'];
    $('datalist').append(option);
  });
};

function autoComplete() {
  var input = $(this).val().trim();
  if (input.length > 0 && event.keyCode != '40' && event.keyCode != '38') {
    var url = "https://api.spotify.com/v1/search?q=" + input + "&type=track&limit=5&q=";
    $.ajax(url, {
      dataType: 'json',
      success: function(r) {
        $('datalist').html('');
        results = r.tracks.items;
        autoCompleteDisplay(results);
      },
      error: function(r) {
        console.log('error', r);
      }
    });
  }
};

function displaySearchResults(results) {
  $(".search-results ol").html('');
  var html = "";
  results.forEach(function(result) {
    html += '<li><div class="song-title">'+'"'+result['name']+'" by <i>'+result['artists'][0]['name']+'</i></div><div class="song-popularity">'+result['popularity']+'</div><div class="song-duration">'+msToMinutesAndSeconds(result['duration_ms'])+'</div><div class="song-delete"><div class="add-btn"><i class="fa fa-plus"></i></div></div></li>';

  });
  $(".search-results ol").append(html);
  addTrackToPlayList();
};

function msToMinutesAndSeconds(ms) {
  var seconds = Math.floor(ms / 1000);
  var hours   = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var seconds = seconds - (hours * 3600) - (minutes * 60);
  var time = "";

  if (hours != 0) {
    time = hours+":";
  }
  if (minutes != 0 || time !== "") {
    minutes = (minutes < 10 && time !== "") ? "0"+minutes : String(minutes);
    time += minutes+":";
  }
  if (time === "") {
    time = seconds+"s";
  }
  else {
    time += (seconds < 10) ? "0"+seconds : String(seconds);
  }
  return time;
};

function convertToMS(time) {
  var arr = time.split(":").map(function(n){ return +n })
  return arr[0]*60*1000 + arr[1]*1000
}

function sortByName() {
  var ol = $(this).closest('.icons').nextAll('.songs:visible').first().find('ol'),
      li = ol.children("li");
  li.detach().sort(function(a, b) {
    var a = $(a).find('.song-title').text().substring(1),
         b = $(b).find('.song-title').text().substring(1);
    if (a > b) return 1;
    if (b > a) return -1;
    return 0;
  });
  ol.append(li);
  updateLocalStorage();

};

function sortByPopularity(){
  var ol = $(this).closest('.icons').nextAll('.songs:visible').first().find('ol'),
      li = ol.children("li");
  li.detach().sort(function(a, b){
    var a = parseInt($(a).find('.song-popularity').html()),
        b = parseInt($(b).find('.song-popularity').html());
    if (a > b) return -1;
    if (b > a) return 1;
    return 0;
  });
  ol.append(li);
  updateLocalStorage();
};

function sortByDuration() {
  var ol = $(this).closest('.icons').nextAll('.songs:visible').first().find('ol'),
      li = ol.children('li');

  li.detach().sort(function(a, b){
    var a = convertToMS($(a).find('.song-duration').text()),
        b = convertToMS($(b).find('.song-duration').text());
    if (a > b) return -1;
    if (b > a) return 1;
    return 0;
  });
  ol.append(li);
  updateLocalStorage();
};

function changePlayListName(name){
  $('h1.playlist span.playlist-name').html(name);
};

function addTags(){
  $('.tags').hover(function(){
    $('.tags .fa.fa-tags').css('display','inline-block');
  });
  $('.tags i.fa.fa-tags').on('click', function(){
    input = $('.tags input').val().trim();
    if (input.length == 0) {
      $('.tags span').text('');
      $('.tags input').css('display','inline-block');
    } else if (input.length > 0) {
      $('.tags span').text(input);
      $('.tags input').val('');
      $('.tags input').css('display', 'none');
      updateLocalStorage();
    }
  });
};

function attachEventListeners(){
  var $editTitleButton = $('h1.playlist .fa-pencil'),
      $submitNewTitleButton = $('.title i.fa.fa-plus'),
      $titleInput = $('.title .title-input'),
      $playListTitle = $('.title h1.playlist'),
      $playListInput = $('.title input.change-playlist-name'),
      $deleteBtns = $('.delete-btn');

  $editTitleButton.on('click',function(){
    toggleDisplay($titleInput, $playListTitle);
  });

  $submitNewTitleButton.on('click', function(){
    var newName = $playListInput.val().trim();
    if (newName.length > 0) {
      $playListInput.val('');
      changePlayListName(newName);
      toggleDisplay($playListTitle, $titleInput);

      updateLocalStorage();
    }
  });

  $deleteBtns.on('click', deleteTrack);

  $('#search').on('click', function(ev) {
    word = $('input.search').val().trim();
    if (word.length > 0) {  
      var url = "https://api.spotify.com/v1/search?q=" + word + "&type=track&limit=50&q=";
      $.ajax(url, {
            dataType: 'json',
            success: function(r) {
              results = r.tracks.items;
              displaySearchResults(results);
            },
            error: function(r) {
              console.log('error', r);
              alert('Something went wrong. Please try again.')
            }
        });
      toggleDisplay($('.search-results'), $('.playlist'));
      toggleDisplay($('.title h1.search'), $('.title .playlist-title-box'));
    } else {
      alert('Please enter the song name!');
    }
  });

  $('input.search').on('keyup', autoComplete);
  $('.icon-clock').on("click", sortByDuration);
  $('.icon-cool').on("click", sortByPopularity)
  $('.icon-track').on("click", sortByName)

};

attachEventListeners();

addTags();
getItemsFromStorage();
addUpTracks();
totalPlaylistTime();
calcCoolFactor();
deleteTrack();
changePlayListName();
