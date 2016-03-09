'use strict';

/* Directives */

angular.module('gestaltung.directives', [])
	.directive('userDashboard', function () {
		return {
			// restrict: 'AE',
			// scope: {
			// 	name: '=name'
			// },
			// template: 'Name: {{name}}',
			link: function(scope, elm, attrs) {
				var mapContainer = d3.select(elm[0])
					.append('div')
					.attr('id', 'mapContainer');

				// Will be inside the reflection
				var timelineContainer = d3.select(elm[0])
					.append('div')
					.attr('id', 'timelineContainer');

				var mapSvg = mapContainer.append('svg').attr('width', 500).attr('height', 500);
				var coordinates = {};
				
				scope.$watch("name", function(newValue, oldValue) {
					// console.log('new val', newValue);
					// artistContainer.append('p').text(scope.name);
					// var container = d3.select(elm[0]).append('p').text(scope.name)
				})

				scope.$watch("data", function(newVal, oldValue) {
					if (scope.data) {
						// Big transition here going through the whole day
					}
				});

				scope.$watch("trackPoints", function(newValue, oldValue) {
					if (scope.trackPoints) {
						try {
							// Used to center the map
							coordinates.maxLat = _.maxBy(scope.trackPoints, 'lat').lat;
							coordinates.minLat = _.minBy(scope.trackPoints, 'lat').lat;
							coordinates.maxLon = _.maxBy(scope.trackPoints, 'lon').lon;
							coordinates.minLon = _.minBy(scope.trackPoints, 'lon').lon;
							mapSvg.remove('path');
							mapSvg.remove('text');
							drawMap();
						}
						catch(e) {
							// No data
							mapSvg.remove('path');
							mapSvg.selectAll('text')
								.data('No Data')
								.enter()
								.append('text');
						}
					}
				});

				var drawMap = function() {
					var width = 500;
					var height = 500;

					var latScale = d3.scale.linear()
						.domain([coordinates.maxLat, coordinates.minLat])
						.range([20, height-20])

					var lonScale = d3.scale.linear()
						.domain([coordinates.maxLon, coordinates.minLon])
						.range([20, width-20])

					var lineFunction = d3.svg.line()
						.x(function(d) { return lonScale(d.lon); })
						.y(function(d) { return latScale(d.lat); })
						.interpolate("linear");

					mapSvg = mapContainer.append('svg').attr('width', width).attr('height', height);
					
					var path = mapSvg
						.append("path")
						.attr("d", lineFunction(scope.trackPoints))
						.transition()
						.duration(500)
						.attr("stroke", "white")
						.attr("stroke-width", 2)
						.attr("fill", "none");

					mapSvg.append("text")
						.text(scope.date);

					mapSvg
						.selectAll("circle")
							.data(scope.places)
						.enter()
						.append("circle")
						.transition()
						.duration(2000)
						.attr("r", 4)
						.attr("fill", "red")
						.attr("cx", function(d) {
							return lonScale(d.location.lon);
						})
						.attr("cy", function(d) {
							return latScale(d.location.lat);
						})
				}
			}
		}  
	})
	.directive('artistCloud', function() {
		return {
			link: function(scope, elm, attrs) {
				var artistContainer = d3.select(elm[0])
					.append('div')
					.attr('id', 'artistContainer');

				scope.$watch("data", function(newValue, oldValue) {
					if (newValue == oldValue) {
						// Initializing
						return;
					}


					var artists = _.uniqBy(scope.data.lastfmScrobbles, 'artist');

					d3.select('#artistContainer').selectAll("*").remove();
					artistContainer.selectAll('p')
						.data(artists, function(d) {
							return d.artist;
						})
						.enter()
						.append('p')
						.text(function(d) {
							return d.artist;
						})
					
				})
			}
		}
	})
	.directive('placesSummary', function() {
		return {
			link: function(scope, elm, attr) {
				var placesContainer = d3.select(elm[0])
					.append('div')
					.attr('id', 'placesContainer');

				scope.$watch('data', function(newValue, oldValue) {
					if (newValue == oldValue) {
						return;
					}
					var places = _.filter(scope.data.movesStoryline, function(d) {
						if (d.type === 'place') {
							return d.place !== 'unknown'
						}
						return false;
					})
					console.log('scope.places', scope.places);

					places = _.uniqBy(places, 'place');
					console.log('places', places);

					d3.select('#placesContainer').selectAll("*").remove();
					placesContainer.selectAll('p')
						.data(places)
						.enter()
						.append('p')
						.text(function(d) {
							return d.place;
						})
				})
			}
		}
	})
	.directive('userReflection', function() {
		return {
			link: function(scope, elm, attrs) {
				var mirrorContainer = d3.select(elm[0])
					.append('div')
					.attr('id', 'mirrorContainer');

				scope.$watch("data", function(newVal, oldValue) {
					if (scope.data) {
						// get user media
						// webcam
						var camTex;
						var uniforms, scene, camera, renderer, texture;
						var videoLoaded = false;
						var video = $(elm).append('<video id="video"></video>');
						var container = $(elm).append('<div id="container"></div>');
						container = document.getElementById("container");
						var clock = new THREE.Clock();
						
						video = document.getElementById("video");
						video.autoplay = true;

						video.addEventListener( 'loadedmetadata', function ( event ) {
						    video.style.width = window.innerWidth + 'px';
						    video.style.height = window.innerHeight + 'px';

						    initGL();
						});

				    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
					
					  if (navigator.getUserMedia) {       
				      navigator.getUserMedia({video: true, audio: false}, function(stream) {
							  var url = window.URL || window.webkitURL;
								video.src = url ? url.createObjectURL(stream) : stream;

								video.autoplay = true;
								// videoLoaded = true;
				      }, function(error) {
						    alert("There seems to be something wrong with your webcam :(");
				      });
					  }

						function initGL() {
							// gl = video.getContext("webgl", { antialias: false,
							// 																	depth: false });

							camera = new THREE.Camera();
							camera.position.z = 1;

							scene = new THREE.Scene();

							texture = new THREE.Texture(video);
							texture.minFilter = THREE.LinearFilter;
							texture.magFilter = THREE.LinearFilter;
							// texture.format = THREE.RGBFormat;
							// texture.generateMipmaps = false;
							// texture.needsUpdate = true;

							uniforms = {
								u_image: {
									type: "t",
									value: 0,
									texture: texture
								}
							}
							
							var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
							var material = new THREE.ShaderMaterial({
								uniforms: uniforms,
								vertexShader: ["varying vec2 vUv;",
									"vec4 pos;",
									"void main() {",
									"vUv = uv;",
									"pos = vec4(position.xy, 0.0, 1.0);",
									"gl_Position=projectionMatrix * modelViewMatrix * pos;",
									"}"].join("\n"),
								fragmentShader: ["uniform sampler2D u_image;",
									"varying vec2 vUv;",
									"void main() {",
									"vec2 mod_texcoord = vUv.xy + vec2((0.2)*cos((0.0005)+5.0*uv.x*3.14159265359),0.0);",
									"gl_FragColor = texture2D(u_image, mod_texcoord);",
									"}"].join("\n")
							});

							var mesh = new THREE.Mesh( geometry, material );
							scene.add(mesh);

							renderer = new THREE.WebGLRenderer();
							renderer.setSize(window.innerWidth, window.innerHeight);
							container.appendChild(renderer.domElement);
							renderer.domElement.style.width = window.innerWidth + 'px';
							renderer.domElement.style.height = window.innerHeight + 'px';

							animate();
						};


						function animate() {
							var delta = clock.getDelta();
							// uniforms.time.value += delta/2;

							requestAnimationFrame(animate);

					    texture.needsUpdate = true;
							if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
							}

							renderer.render( scene, camera );
						}


						function loop() {
							window.requestAnimationFrame(loop);
							if (videoLoaded) {
								
							}
						}


				    
					}
				});
			}
		}
	});