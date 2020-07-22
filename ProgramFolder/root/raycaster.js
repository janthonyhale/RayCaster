/*
  Description: Ray caster
  Author: James Hale janthonyhale@gmail
  Date: July 2020
*/

class Room
{
  /*
    Room class
  */
  constructor(h, w)
  {
    /*
      Constructor method
      param h: Height of the room
      param w: Width of the room
    */
    this.height = h; this.width = w // Set height and width of room
    this.room = this.generate_room() // Generate and set the room
  }

  generate_room()
  {
    /*
      Generates the room
      returns: 2D array of room size of ones and zeros
    */
    let room_ = []
    while(room_.push([]) <= this.height)
      while(room_[room_.length - 1].push(Math.floor(Math.random() * 2)) <
        this.width) {}
    /*
     Added on an extra list due to '<='(basically I did this because of the
     nature of the while loop)
    */
    room_.pop()
    return room_
  }

  print_room()
  {
    /*
      Prints the room to the console
      returns: void
    */
    let line = null
    for(let i = 0; i < this.height; i++)
    {
      line = ""
      for(let j = 0; j < this.width; j++) line += this.room[i][j] + " ";
      console.log(line)
    }
  }

  /* Get the width, height and room */
  get_width() {return this.room[0].length}
  get_height(){return this.room.length}
  get_room() {return this.room}
}


class Human
{
  /*
    This class is the human player (The person in the environment)
  */
  constructor(room_)
  {
    /*
        Constructor method for the human
      param room_; The in which room our human resides
    */
    this.x = 0; this.y = 0 // Initial location
    this.x_diff = null; this.y_diff = null // Initial offset in current square
    this.heading = 0 // Initial heading (radians)
    this.periphery = Math.PI / 4 // 45 degrees
    this.heading_increment = .1 // Rotation speed
    this.room = room_ // Initialize the room we're in
    this.mousedown = false // Is mouse down? If so, we rotate
  }

  move(x_, y_, max_height, max_width)
  {
    let i = Math.floor((y_ / max_height) * this.room.get_room().length)
    let j = Math.floor((x_ / max_width) * this.room.get_room()[0].length)
    if (0 <= i && i < this.room.get_height() && 0 <= i &&
      j < this.room.get_width() && this.room.get_room()[i][j] == 0)
        {this.x = x_; this.y = y_}
  }

  increment_heading()
  {
    /*
      Increments the heading
      returns: void
    */
    this.heading += this.heading_increment
    while (this.heading >= 2 * Math.PI) this.heading = 0
  }

  set_diff(max_x, max_y)
  {
    /*
      Finds and sets the offset of the human in its current square
    */
    this.x_diff = Math.floor(this.x - Math.floor(this.x / max_x *
      this.room.get_width()) / this.room.get_width() * max_x)
    this.y_diff =  Math.floor(this.y - Math.floor(this.y / max_y *
      this.room.get_height()) / this.room.get_height() * max_y)
  }

  cast_rays(num_rays, max_x, max_y)
  {
    /*
        Casts <num_rays> rays
        returns: an array of the x, y endpoints of each array
    */
    this.set_diff(max_x, max_y) // Update the offset
    let rays = []
    // Set values we'll use in the for loop
    let angle = null; let angle_increment = this.periphery / num_rays
    for(let i = 0; i < num_rays; i++)
    {
      angle = this.heading - this.periphery + i * angle_increment
      // Make sure the angle is within bounds
      while(angle >= Math.PI * 2) angle -=  Math.PI * 2
      while(angle < 0) angle +=  Math.PI * 2
      rays.push(this.cast_ray(Math.min(Math.PI * 2, angle), max_x /
        this.room.get_width(), max_y / this.room.get_height(), max_x, max_y))
    }
    return rays
  }

  cast_ray(angle, sqr_size_hor, sqr_size_vert, max_x, max_y)
  {
    /*
        Casts one ray and returns the x, y location where the ray ends
      param angle:
      param sqr_size_hor:
      param sqr_size_vert:
      param max_x:
      param max_y:
      returns: An array of x y locations where the rays end
    */
    // If we come from the left or above, we need an extra kick
    let delta_i = 0
    let delta_j = 0
    // Horizontal axis, increase x by x
    let horizontal_increment = sqr_size_hor / Math.tan(angle)
    // Vertical axis, increase y by y
    let vertical_increment = sqr_size_vert * Math.tan(angle)
    /* Find the first intersction of horizontal line */
    let first_horizontal = null // Define
    if(angle <= Math.PI)
      first_horizontal = [this.x + (sqr_size_vert - this.y_diff) /
        Math.tan(angle), this.y + (sqr_size_vert - this.y_diff)]
    else
      first_horizontal = [this.x - this.y_diff / Math.tan(angle),
        this.y - this.y_diff]
    // Horizontal increment should decrease as the angle points down
    if(angle >= Math.PI) horizontal_increment *= -1
    // Horizontal intersect y axis increment
    if(angle >= Math.PI) {delta_i = -1; sqr_size_vert *= -1}
    // Find how far our horizontal increments go before the edge or a block
    while(true)
    {
      let i = Math.max(0, Math.min(9, Math.floor(first_horizontal[1] / max_y *
        this.room.get_height()))) + delta_i
      let j = Math.max(0, Math.min(9, Math.floor(first_horizontal[0] / max_x *
        this.room.get_width())))
      // Check if intersects border
      if(i < 0 || first_horizontal[0] <= 0
        || first_horizontal[0] >= max_x || first_horizontal[1] <= 0
        || first_horizontal[1] >= max_y || this.room.get_room()[i][j] == 1)
          break
      // Increment the intersection
      first_horizontal[0] += horizontal_increment
      first_horizontal[1] += sqr_size_vert
    }
    /* Find the first intersction of vertical line */
    let first_vertical = null // Define
    if(Math.PI / 2 <= angle && angle < 3 * Math.PI / 2)
      first_vertical = [this.x - this.x_diff, this.y - this.x_diff *
        Math.tan(angle)]
    else
      first_vertical = [this.x + (sqr_size_hor - this.x_diff), this.y +
        (sqr_size_hor - this.x_diff) * Math.tan(angle)]
    // Vertical intersect vertical increment
    if(angle >= Math.PI / 2 && angle < 3 * Math.PI / 2) vertical_increment *= -1
    // Vertical intersect x axis increment
    if(angle >= Math.PI / 2 && angle < 3 * Math.PI / 2) {delta_j = -1;
      sqr_size_hor *= -1}
    // Find how far our vertical increments go before the edge or a block
    while(true)
    {
      let i = Math.max(0, Math.min(9, Math.floor(first_vertical[1] / max_y *
        this.room.get_height())))
      let j = Math.max(0, Math.min(9, Math.floor(first_vertical[0] / max_x *
        this.room.get_width()))) + delta_j
      // Check if intersects border
      if(j < 0 || first_vertical[0] <= 0 || first_vertical[0] >= max_x
        || first_vertical[1] <= 0 || first_vertical[1] >= max_y
        || this.room.get_room()[i][j] == 1)
          break
      // Increment the intersection
      first_vertical[0] += sqr_size_hor
      first_vertical[1] += vertical_increment
    }
    if(Math.pow((first_vertical[0] - this.x), 2) + Math.pow((first_vertical[1] -
       this.y), 2) < Math.pow((first_horizontal[0] - this.x), 2) +
       Math.pow((first_horizontal[1] - this.y), 2))
        return first_vertical
    return first_horizontal
  }

  slice_sizes(rays, max_y)
  {
    /*
      param rays: 2D array of ray end points
      param max_y: Height of y axis
      returns: array of wall slice sizes
    */
    let heights = []
    let angle_increment = this.periphery / rays.length; let angle = null
    for(let i = 0; i < rays.length; i++)
    {
      angle = this.heading - this.periphery + i * angle_increment
      angle = Math.abs(angle - this.heading)
      // Fix the angles
      while(angle >= Math.PI * 2) angle -=  Math.PI * 2
      while(angle < 0) angle +=  Math.PI * 2
      // The height should be inversely proportional to the slice_distance
      // Far away items are smaller (this number scaled everything how I wanted)
      heights.push(10000 / this.slice_distance(rays[i], angle))
    }
    return heights
  }

  slice_distance(ray, angle)
  {
    /*
      param ray: x, y coordinate of ray endpoint
      returns: Adjusted distance from the wall
    */
    return Math.pow(Math.pow((ray[0] - this.x), 2) + Math.pow((ray[1] - this.y),
      2), .5) * Math.cos(angle)
  }
  /* Setter and getter for if the mouse is down (we rotate if so) */
  set_mousedown(bool_val) {this.mousedown = bool_val}
  is_mousedown() {return this.mousedown}
  /* The x and y location of the human */
  get_pos(){return [this.x, this.y]}
}

function animate(canvas_overview_, context_overview_, canvas_raycast_,
  context_raycast_, room_, player_)
{
  /*
    Animation
    returns: void
  */
  requestAnimationFrame(function(){animate(canvas_overview_, context_overview_,
    canvas_raycast_, context_raycast_, room_, player_)})
  // Rotate while the mouse is down
  if (player_.is_mousedown()) player_.increment_heading()
  // Clear the screen to re-animate
  context_overview_.clearRect(0, 0, canvas_overview_.height,
    canvas_overview_.width)
  context_raycast_.clearRect(0, 0, canvas_overview_.height,
    canvas_overview_.width)
  // Fill the hallways (background) with grey
  context_overview_.fillStyle = "black"
  context_overview_.fillRect(0, 0, canvas_overview_.width,
    canvas_overview_.height)
  // Now, we must draw our player and rays (in white)
  context_overview_.fillStyle = context_overview_.strokeStyle = "white"
  rays = player_.cast_rays(100, canvas_overview_.height, canvas_overview_.width)
  // Draw the rays
  for(let i = 0; i < rays.length; i++)
  {
    context_overview_.beginPath()
    context_overview_.moveTo(player_.get_pos()[0], player_.get_pos()[1])
    context_overview_.lineTo(rays[i][0], rays[i][1]);
    context_overview_.stroke()
  }
  // Draw the ceilling
  context_raycast_.fillStyle = "grey"
  context_raycast_.fillRect(0, 0, canvas_overview_.width,
    canvas_overview_.height / 2)
  // Draw the floor
  context_raycast_.fillStyle = "white"
  context_raycast_.fillRect(0, canvas_overview_.height / 2,
    canvas_overview_.width, canvas_overview_.height / 2)
  // Render the "3D" environment (on the right canvas)
  // Get the slice heights
  let heights = player_.slice_sizes(rays, canvas_raycast_.height)
  let win_increment = canvas_overview_.height / heights.length // Slice size
  let val = null; let wall_height = null
  for(let i = 0; i < heights.length; i++)
  {
    wall_height = heights[i]
    // Set color of each slice
    // Grey value, these numbers seemd to work
    val = Math.min(90, Math.abs(wall_height) / 3)
    console.log(val);
    context_raycast_.fillStyle = "rgb(" + val + ", " + val + ", " + val + ")"
    context_raycast_.fillRect(win_increment * i, 350 - wall_height / 2,
      win_increment, wall_height)
  }
}


function main()
{
  // Get the canvases
  let canvas_raycast = document.querySelector('#raycast')
  let canvas_overview = document.querySelector('#overview')
  // Get the contexts
  let context_raycast = canvas_raycast.getContext('2d')
  let context_overview = canvas_overview.getContext('2d')
  // Generate the random room
  let room = new Room(10, 10)
  // Create the human
  let player = new Human(room)
  // For movement
  canvas_overview.addEventListener
  (
    'mousemove',
    function(event)
    {
      player.move(event.clientX - canvas_overview.offsetLeft,
        event.clientY - canvas_overview.offsetTop, canvas_overview.height,
        canvas_overview.width)
    }
  )
  canvas_overview.addEventListener
  (
    'mousedown',
    function(event)
    {
      player.set_mousedown(true)
      player.increment_heading()
    }
  )
  canvas_overview.addEventListener
  (
    'mouseup',
    function(event)
    {
      player.set_mousedown(false)
    }
  )
  animate(canvas_overview, context_overview, canvas_raycast, context_raycast,
    room, player)
}

main()
/*
  Resources:
    On javascript and html:
    https://www.youtube.com/watch?v=yq2au9EfeRQ
    On raycasting:
    https://lodev.org/cgtutor/raycasting.html
    On raycasting:
    https://www.youtube.com/watch?v=eOCQfxRQ2pY&t=777s
    Main source of inspiration:
    https://www.youtube.com/watch?v=vYgIKn7iDH8&list=LLfRrVCCymB_kgXJU5PwwAQg&in
      dex=13&t=1502s
*/
