"use client";

import styles from "./default-dashboard-view.module.css";

export function DefaultDashboardView() {
	return (
		<div className={styles.dlmRoot}>
				<header className={styles.hero}>
					<div className={styles.heroContent}>
					<h1>Computer Lab Manager</h1>
					<p className={styles.tagline}>
						Orchestrate labs & clusters with confidence — sync users, deploy updates, and monitor health.
					</p>
					<div className={styles.badges}>
						<span className={styles.badge}>🔐 Access</span>
						<span className={styles.badge}>⚙️ Automation</span>
						<span className={styles.badge}>📊 Monitoring</span>
					</div>
				</div>
				<div className={styles.heroDecor} aria-hidden />
			</header>

			<main className={styles.container}>
				<section className={styles.introCard}>
					<h2>Welcome 👋</h2>
					<p>
						Computer Lab Manager helps you manage university computer labs and clusters: centralized user
						management, coordinated updates, remote access, and observability — all in one place.
					</p>

					<div className={styles.quickStart}>
						<h3>Quick start</h3>
						<div className={styles.steps}>
							<div className={styles.step}>
								<div className={styles.stepIndex}>1</div>
								<div>
									<strong>Set up computers</strong>
									<p className={styles.muted}>Go to Access Management → Computers and register your machines.</p>
								</div>
							</div>

							<div className={styles.step}>
								<div className={styles.stepIndex}>2</div>
								<div>
									<strong>Add users</strong>
									<p className={styles.muted}>Then add user accounts in Access Management → Users.</p>
								</div>
							</div>

							<div className={styles.step}>
								<div className={styles.stepIndex}>3</div>
								<div>
									<strong>Proceed</strong>
									<p className={styles.muted}>Afterwards configure sync, monitoring, and remote access.</p>
								</div>
							</div>
						</div>

						<div className={styles.actions}>
							{/* Primary admin actions */}
							<button
								className={`${styles.btn} ${styles.btnPrimary}`}
								onClick={() => {
									// Admin computers page from adminNavMain
									window.location.hash = "#admin-computers";
								}}
								aria-label="Open Computers"
							>
								🖥️ Open Computers
							</button>

							<button
								className={`${styles.btn} ${styles.btnGhost}`}
								onClick={() => {
									// Admin users page from adminNavMain
									window.location.hash = "#admin-users";
								}}
								aria-label="Manage Users"
							>
								👥 Manage Users
							</button>
						</div>
					</div>
				</section>

				<section className={styles.features}>
					<h3>Core features</h3>
					<ul>
						<li>Centralized user management and synchronization</li>
						<li>Automated system updates and remote access tools</li>
						<li>Monitoring integrations (Prometheus / Grafana) and IaC tooling</li>
					</ul>
				</section>
			</main>
		</div>
	);
}