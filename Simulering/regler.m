clc; clf; clear;

% System
sys = 'v'; % För hastighet
%sys = 'o'; % För orientering


% Simulerings värden
r = 36.5 / 1000;	% m
t = 2.4 / 1000;		% m
r_i = 31.5 / 1000;	% m

m_s = 45 / 1000;	% kg
m_i = 150 / 1000;	% kg
M = 686 / 1000;		% kg
I = 0.0111;			% kg / m^2

l = 120 / 1000;		% m
b = 100 / 1000;		% m
R = sqrt(l^2+b^2);	% m


I_s = 2 / 5 * m_s * (r^5 - (r-t)^5 / ( r^3 - (r-t)^3 ));
I_i = 1 / 5 * m_i * r_i^2;


% Reglerings värden
if (sys == 'v')
	w_c = 6;
	zeta = 1;
	beta = 10;
	phi_m = 45;
elseif (sys == 'o')
	w_c = 5;
	zeta = 1;
	beta = 10;
	phi_m = 40;
end

% G (överföringsfunktion)
G_tau_v = tf([4*r], [M*r^2+4*((m_s+m_i)*r^2+I_s) 0]);
G_tau_theta = tf([4*R], [(I+4*(I_s * ( 1 + R/r )+I_i+(m_s+m_i)*R^2))*r 0 0]);

if (sys == 'v')
	G = G_tau_v;
elseif (sys == 'o')
	G = G_tau_theta;
end


GG = @(w)(evalfr(G, j*w));

F_phase = mod(phi_m - 180 - radtodeg(angle(GG(w_c))), 360)


% Avläsningsvärden
if (sys == 'v')
	w_cTau = 0.45;
	K_infAbsG = 3.65;
elseif (sys == 'o')
	w_cTau = 3.9;
	K_infAbsG = 2.5;
end


% Boom boom boxx
tau = w_cTau / w_c
K_i = K_infAbsG / ( abs(GG(w_c)) * tau * beta )


%
T_f = tau / beta;
T_i = 2*zeta*tau - T_f;
T_d = tau^2 / T_i - T_f;

K_p = K_i * T_i
K_i
K_d = K_p * T_d
N = 1 / T_f





