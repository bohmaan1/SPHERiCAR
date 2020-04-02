function [driveDir, rotDir, speed]  = fcn(t, activeSens, rotDirOld, realAngle, difAngle, orginal_speed)
driveDir = [0.001; 0.001; 0.001; 0.001];
rotDir = rotDirOld;

% all values are estimated and may be needed to modify

% input från simulink... right_sensor = distance from the leader, i don't
% know how activesens should be converted to dist_to_leader
% in javascript: dist_to_leader = (right_sensor + left_sensor)/2;

if dist_to_leader < 40 % [cm] not sure how much 40 is in simulink but it 
                       % should be equal to 40 cm in reality
    speed = orginal_speed * 1.2;
elseif dist_to_leader > 10 % [cm]
    speed = orginal_speed * 0.8;
else 
    speed = orginal_speed;
end

if right_sensor > left_sensor 
   % turn left
elseif right_sensor < left_sensor 
   % turn right
else 
   % continue straight forward with speed
end
end
