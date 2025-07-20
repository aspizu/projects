costumes "pixel.svg";
hide;

%define SCREEN_W 116
%define SCREEN_H 88

%define W 28
%define H 21

enum Dir {
    U,
    R,
    D,
    L,
}

struct Tile {
    dir,
    food = false,
    corner = "",
    x,
    y,
}
%define getv2(obj) V2{x:obj.x, y:obj.y}

struct V2 {x = 0, y = 0}

list Tile snake;
list V2 food;
var dir = Dir.R;
var lastkey = "";
var score = 0;

onflag {
    game_over = false;
    V2 pos = V2{x: W//2, y: H//2};
    delete snake;
    delete food;
    dir = Dir.R;
    lastkey = "";
    score = 0;
    add Tile {dir: dir, x: pos.x-3, y: pos.y} to snake;
    add Tile {dir: dir, x: pos.x-2, y: pos.y} to snake;
    add Tile {dir: dir, x: pos.x-1, y: pos.y} to snake;
    spawn_food;

    time = 0;
    forever {
        erase_all;
        render;
        if not game_over {
            tick;
        }
        wait 0.2;
        time++;
    }
}

onflag {
    forever {
        if key_pressed("left arrow") {
            lastkey = "left arrow";
        }
        elif key_pressed("right arrow") {
            lastkey = "right arrow";
        }
        until not key_pressed("any") {}
    }
}

proc tick {
    local d = "";
    if lastkey == "right arrow" {
        d = (dir+1) % 4;
        lastkey = "";
    }
    if lastkey == "left arrow" {
        d = (dir-1) % 4;
        lastkey = "";
    }
    add Tile {dir: dir, corner: d, x: pos.x, y: pos.y} to snake;
    if d != "" {
        dir = d;
    }
    local eaten = false;
    local i = 1;
    repeat length(food) {
        if food[i].x == pos.x and food[i].y == pos.y {
            snake[length(snake)].food = true;
            delete food[i];
            eaten = true;
        }
        i++;
    }
    if not eaten {
        delete snake[1];
    }
    if dir == Dir.L {
        pos.x--;
    } elif dir == Dir.R {
        pos.x++;
    } elif dir == Dir.U {
        pos.y++;
    } elif dir == Dir.D {
        pos.y--;
    }
    pos.x = pos.x % W;
    pos.y = pos.y % H;
    local i = 1;
    repeat length(food) {
        if food[i].x == pos.x and food[i].y == pos.y {
            score++;
        }
        i++;
    }
    local i = 1;
    repeat length(snake) {
        if snake[i].x == pos.x and snake[i].y == pos.y {
            game_over = true;
        }
        i++;
    }
    if eaten and not game_over {
        spawn_food;
    }
}

proc spawn_food {
    forever {
        local V2 f = V2 {x: random(0, W - 1), y: random(0, H - 1)};
        local valid = not (f.x == pos.x and f.y == pos.y);
        local i = 1;
        repeat length(snake) {
            if snake[i].x == f.x and snake[i].y == f.y {
                valid = false;
            }
            i++;
        }
        local i = 1;
        repeat length(food) {
            if food[i].x == f.x and food[i].y == f.y {
                valid = false;
            }
            i++;
        }
        if valid {
            add f to food;
            stop_this_script;
        }
    }
}

proc render {
    draw_horz 0, SCREEN_W, 0;
    draw_horz 0, SCREEN_W, SCREEN_H - 1;
    draw_vert 0, SCREEN_H, 0;
    draw_vert 0, SCREEN_H, SCREEN_W  -1;
    if not game_over or time % 2 == 0 {
        render_snake;
    }
    local i = 1;
    repeat length(food) {
        draw_food food[i].x*4, food[i].y*4;
        i++;
    }
    
}

proc render_snake {
    local i = 1;
    repeat length(snake) {
        if i == 1 {
            if snake[i].corner != "" {
                draw_tail snake[i].x*4, snake[i].y*4, snake[i].corner;
            } else {
                draw_tail snake[i].x*4, snake[i].y*4, snake[i].dir;
            }
        }
        elif snake[i].corner != "" {
            draw_corner snake[i].x*4, snake[i].y*4, snake[i].dir, snake[i].corner, snake[i].food;
        } else {
            draw_body snake[i].x*4, snake[i].y*4, snake[i].dir, snake[i].food;
        }
        i++;
    }
    local V2 f = pos;
    if dir == Dir.L {
        f.x--;
    } elif dir == Dir.R {
        f.x++;
    } elif dir == Dir.U {
        f.y++;
    } elif dir == Dir.D {
        f.y--;
    }
    local about_to_eat = false;
    local i = 1;
    repeat length(food) {
        if food[i].x == f.x and food[i].y == f.y {
            about_to_eat = true;
        }
        i++;
    }
    draw_head pos.x*4, pos.y*4, about_to_eat;
}

proc draw_horz x1, x2, y {
    local x = $x1;
    repeat $x2 - $x1 {
        draw_pixel x, $y;
        x++;
    }
}

proc draw_vert y1, y2, x {
    local y = $y1;
    repeat $y2 - $y1 {
        draw_pixel $x, y;
        y++;
    }
}

proc draw_pixel x, y {
    goto 2+($x-SCREEN_W/2) * 4, 2+($y-SCREEN_H/2) * 4;
    stamp;
}

proc draw_gamepix x, y {
    draw_pixel 2+$x, 2+$y;
}

proc draw_corner x, y, dir, corner, food {
    if $dir == Dir.R or $corner == Dir.L {
        draw_gamepix $x + 0, $y + 1;
        draw_gamepix $x + 0, $y + 2;
    }
    if $dir == Dir.L or $corner == Dir.R {
        draw_gamepix $x + 3, $y + 1;
        draw_gamepix $x + 3, $y + 2;
    }
    if ($dir == Dir.U and $corner == Dir.L)
    or ($dir == Dir.R and $corner == Dir.D)
    or ($dir == Dir.L and $corner == Dir.U)
    or ($dir == Dir.D and $corner == Dir.R) {
        draw_gamepix $x + 1, $y + 2;
        draw_gamepix $x + 2, $y + 1;
    } else {
        draw_gamepix $x + 1, $y + 1;
        draw_gamepix $x + 2, $y + 2;
    }
    if $dir == Dir.U or $corner == Dir.D {
        draw_gamepix $x + 1, $y + 0;
        draw_gamepix $x + 2, $y + 0;
    }
    if $dir == Dir.D or $corner == Dir.U {
        draw_gamepix $x + 1, $y + 3;
        draw_gamepix $x + 2, $y + 3;
    }
    if $food {
        if $dir == Dir.U and $corner == Dir.R {
            draw_gamepix $x + 3, $y + 0;
        }
        if $dir == Dir.U and $corner == Dir.L {
            draw_gamepix $x + 0, $y + 0;
        }
        if $dir == Dir.D and $corner == Dir.R {
            draw_gamepix $x + 3, $y + 3;
        }
        if $dir == Dir.D and $corner == Dir.L {
            draw_gamepix $x + 0, $y + 3;
        }
        if $dir == Dir.R and $corner == Dir.U {
            draw_gamepix $x + 0, $y + 3;
        }
        if $dir == Dir.R and $corner == Dir.D {
            draw_gamepix $x + 0, $y + 0;
        }
        if $dir == Dir.L and $corner == Dir.U {
            draw_gamepix $x + 3, $y + 3;
        }
        if $dir == Dir.L and $corner == Dir.D {
            draw_gamepix $x + 3, $y + 0;
        }
    }
}

proc draw_body x, y, dir, food {
    local horz = $dir == Dir.L or $dir == Dir.R;
    if $food or horz {
        draw_gamepix $x + 0, $y + 1;
        draw_gamepix $x + 0, $y + 2;
    }
    if $food or not horz {
        draw_gamepix $x + 1, $y + 0;
        draw_gamepix $x + 2, $y + 0;
    }
    if $dir == Dir.R or $dir == Dir.D {
        draw_gamepix $x + 1, $y + 2;
        draw_gamepix $x + 2, $y + 1;
    } else {
        draw_gamepix $x + 1, $y + 1;
        draw_gamepix $x + 2, $y + 2;
    }
    if $food or horz {
        draw_gamepix $x + 3, $y + 1;
        draw_gamepix $x + 3, $y + 2;
    }
    if $food or not horz {
        draw_gamepix $x + 1, $y + 3;
        draw_gamepix $x + 2, $y + 3;
    }
}

proc draw_food x, y {
    draw_gamepix $x + 0, $y + 2;
    draw_gamepix $x + 2, $y + 2;
    draw_gamepix $x + 1, $y + 1;
    draw_gamepix $x + 1, $y + 3;
}

proc draw_head x, y, about_to_eat {
    if dir == Dir.R {
        draw_gamepix $x + 0, $y + 1;
        draw_gamepix $x + 0, $y + 3;
        draw_gamepix $x + 1, $y + 1;
        draw_gamepix $x + 1, $y + 2;
        if $about_to_eat {
            draw_gamepix $x + 2, $y + 0;
            draw_gamepix $x + 2, $y + 3;
        } else {
            draw_gamepix $x + 2, $y + 1;
            draw_gamepix $x + 2, $y + 2;
        }
    } elif dir == Dir.L {
        draw_gamepix $x + 3, $y + 1;
        draw_gamepix $x + 3, $y + 3;
        draw_gamepix $x + 2, $y + 1;
        draw_gamepix $x + 2, $y + 2;
        if $about_to_eat {
            draw_gamepix $x + 1, $y + 0;
            draw_gamepix $x + 1, $y + 3;
        } else {
            draw_gamepix $x + 1, $y + 1;
            draw_gamepix $x + 1, $y + 2;
        }
    } elif dir == Dir.D {
        draw_gamepix $x + 0, $y + 3;
        draw_gamepix $x + 2, $y + 3;
        draw_gamepix $x + 1, $y + 2;
        draw_gamepix $x + 2, $y + 2;
        if $about_to_eat {
            draw_gamepix $x + 0, $y + 1;
            draw_gamepix $x + 3, $y + 1;
        } else {
            draw_gamepix $x + 1, $y + 1;
            draw_gamepix $x + 2, $y + 1;
        }
    } elif dir == Dir.U {
        draw_gamepix $x + 0, $y + 0;
        draw_gamepix $x + 2, $y + 0;
        draw_gamepix $x + 1, $y + 1;
        draw_gamepix $x + 2, $y + 1;
        if $about_to_eat {
            draw_gamepix $x + 0, $y + 2;
            draw_gamepix $x + 3, $y + 2;
        } else {
            draw_gamepix $x + 1, $y + 2;
            draw_gamepix $x + 2, $y + 2;
        }
    }
}

proc draw_tail x, y, dir {
    if $dir == Dir.L or $dir == Dir.R {
        draw_gamepix $x + 0, $y + 1;
        draw_gamepix $x + 1, $y + 1;
        draw_gamepix $x + 2, $y + 1;
        draw_gamepix $x + 3, $y + 1;
        if $dir == Dir.R {
            draw_gamepix $x + 2, $y + 2;
            draw_gamepix $x + 3, $y + 2;
        } else {
            draw_gamepix $x + 0, $y + 2;
            draw_gamepix $x + 1, $y + 2;
        }
    } else {
        draw_gamepix $x + 2, $y + 0;
        draw_gamepix $x + 2, $y + 1;
        draw_gamepix $x + 2, $y + 2;
        draw_gamepix $x + 2, $y + 3;
        if $dir == Dir.U {
            draw_gamepix $x + 1, $y + 2;
            draw_gamepix $x + 1, $y + 3;
        } else {
            draw_gamepix $x + 1, $y + 0;
            draw_gamepix $x + 1, $y + 1;
        }
    }
}
