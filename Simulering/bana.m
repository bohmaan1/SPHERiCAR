clc;

thickness = 0.023;
linePath = [1 1; 2 2; 1 2; 1 1];

x = 1;
y = 2;

xx = 1.5;
yy = 2;

b = false;

for i = 1 : length(linePath)-1
	p0 = [xx yy];
	
	p1 = linePath(i,:);
	p2 = linePath(i+1,:);
	
	p = p2 - p1;
	
	angle = -atan2(p(2), p(1));
	
	for a = 0:0.01:1
		
		clf;
		hold on;
	
		A = [
			cos(a*angle) -sin(a*angle)
			sin(a*angle)	cos(a*angle)
		];

		p3 = A*transpose(p0);
		p4 = A*transpose(p1);
		p5 = A*transpose(p2);

		scatter(p3(x), p3(y), 'cyan');
		scatter(p4(x), p4(y), 'blue');
		scatter(p5(x), p5(y), 'blue');
		
		axis([-3 3 -3 3]);
		grid on;
		
		pause(0.005);
	end
	
	A = [
		cos(angle) -sin(angle)
		sin(angle)	cos(angle)
	];
	
	p0 = A*transpose(p0);
	p1 = A*transpose(p1);
	p2 = A*transpose(p2);
	
	if or(and(p0(1) >= p1(1), p0(1) <= p2(1)), and(p0(1) >= p2(1), p0(1) <= p1(1)))
		% IT IS INBETWEEN! COMPARE Y COORDS
		if abs(p0(y)-p1(y)) <= thickness
			% WE ARE POSITIVE
			b = true;
			break;
		end
	elseif min(norm(p1-p0), norm(p2-p0)) <= thickness
		b = true;
		break;
	end
	
end

b