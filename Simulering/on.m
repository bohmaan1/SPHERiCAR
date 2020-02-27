function [on] = on(i,driveSens)
%Är sensorn i släckt? Isåfall on = 0, är den tänd on = 1
k = 1;
l = 1;
m = 1;
if( i < 4)
    k = 0;
    l = 0;
    m = 0;
elseif(i < 5)
    k = 0;
    l = 0;
    m = 1;
elseif(i < 6)
    k = 0;
    l = 1;
    m = 1;
end
tmp = driveSens(mod(i+3,9)+k) + driveSens(mod(i+4,9)+l) + driveSens(mod(i+5,9) + m);

if(tmp == 0)
    on = 1;
else
    on = 0;
end

end

