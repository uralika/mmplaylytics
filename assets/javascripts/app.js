function addTrackToPlayList() {
  var addBtns = document.getElementsByClassName('add-btn');
  for (var i = 0; i < addBtns.length; i++) {
  	addBtns[i].addEventListener('mousedown', function(ev) {
  		var track = ev.srcElement.parentElement.parentElement.parentElement;
  		var title = track.children[0].innerHTML;
  	  var cool = track.children[1].innerHTML;
  	  var time = track.children[2].innerHTML;
  	  var li = document.createElement('li');
  	  li.innerHTML = '<div class="song-title">'+title+'</div><div class="song-popularity">'+cool+'</div><div class="song-duration">'+time+'</div><div class="song-delete"><div class="delete-btn"><i class="fa fa-times"></i></div></div></li>';
  	  $('.playlist ol#sortable').append(li);
  	  $('.search-results').css('display', 'none');
  	  $('.playlist').css('display','block');
  	  $('.title h1').html(localStorage['playListName']);
  	  changePlayListName();
  	  addUpTracks();
  	  calcCoolFactor();
  	  totalPlaylistTime();
  	  updateLocalStorage();
  	});
  }
};

function updateLocalStorage() {
	var playListName = $('.title h1').html(),
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
	//changePlayListName();
};

function getItemsFromStorage() {
	var playListName = localStorage['playListName'];
	if (localStorage['playListName']) {
		$('.title').html('<h1>'+playListName+'</h1>');
		$('.playlist ol').html(localStorage['playListSongData']);
		$('.tags span').text(localStorage['playListTags']);
	}
	changePlayListName();
}

function addUpTracks() {
	var totalTracksInput = document.getElementById('total-tracks');
	var totalTracks = $('.songs.playlist #sortable li');
	$("#sortable").sortable( "destroy" );
	$("#sortable").sortable({
		 dropOnEmpty: false,
		 disabled: false,
	   items: 'li',
	   delay: 150	
  });
	deleteTrack();
	updateLocalStorage();
	if (totalTracks.length === 1) {
		totalTracksInput.innerHTML = '1 track';
	} else {
		totalTracksInput.innerHTML = totalTracks.length + ' tracks';
	} 
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
	var deleteBtns = document.getElementsByClassName('delete-btn');
	for (var i = 0; i < deleteBtns.length; i++) {
	  deleteBtns[i].addEventListener('mousedown', function(ev){
	    ev.srcElement.parentElement.parentElement.parentElement.remove();
	  addUpTracks();
	  calcCoolFactor();
	  totalPlaylistTime();
	  });
	}
	updateLocalStorage();
};

function searchTrack() {
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
		  $('.playlist').css('display','none');
		  $('.search-results').css('display', 'block');
		  $('.title h1.search').css('display', 'block');
		  $('.title h1.playlist').css('display', 'none');
		} else {
			alert('Please enter the song name!');
		}
	});
}

function autoCompleteDisplay(results) {
	results.forEach(function(result){
		var option = document.createElement('option');
		option.value = result['name'];
		$('datalist').append(option);
	});
};

function autoComplete() {
  $('input.search').on('keyup',function(event){
  	input = $(this).val().trim();
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
  });
};

function displaySearchResults(results) {
	$(".search-results ol").html('');
	results.forEach(function(result) {
		var li = document.createElement('li');
		li.innerHTML = '<div class="song-title">'+'"'+result['name']+'" by <i>'+result['artists'][0]['name']+'</i></div><div class="song-popularity">'+result['popularity']+'</div><div class="song-duration">'+msToMinutesAndSeconds(result['duration_ms'])+'</div><div class="song-delete"><div class="add-btn"><i class="fa fa-plus"></i></div></div>';
		 $(".search-results ol").append(li);
	});
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
  $('.icon-track').on('click',function(){
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
  });
};

function sortByPopularity(){
	$('.icon-cool').on('click',function(){
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
	});
};

function sortByDuration() {
	$('.icon-clock').on('click',function(){
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
	});
};

function changePlayListName(){
	var changeNameBtn = $('span i.fa.fa-pencil');
	var title = $('.title');
	$(changeNameBtn).on('click',function(){
			// debugger;

		var input = $('<input class="change-playlist-name" placeholder="Ex: Weekend Chill-Out"><i class="fa fa-plus"></i>');
		title.html(input);
		$('.title i.fa.fa-plus').on('click',function(){
			var newName = $('.title input').val().trim();
			if (newName.length > 0) {
				$('.title').html('<h1>'+newName+' <span><i class="fa fa-pencil"></i></span></h1>');
				updateLocalStorage();
			}
		});
	});
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

addTags();
getItemsFromStorage();
autoComplete();
sortByName();
sortByPopularity();
sortByDuration();
searchTrack();
addUpTracks();
totalPlaylistTime();
calcCoolFactor();
deleteTrack();
changePlayListName();
