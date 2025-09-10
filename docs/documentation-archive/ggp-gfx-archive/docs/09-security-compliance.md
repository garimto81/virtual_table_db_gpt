# GGP-GFX Security & Compliance

## Table of Contents
1. [Security Architecture](#security-architecture)
2. [Data Protection & Privacy](#data-protection--privacy)
3. [Compliance Requirements](#compliance-requirements)
4. [Licensing System](#licensing-system)
5. [Threat Modeling](#threat-modeling)
6. [Security Monitoring](#security-monitoring)
7. [Incident Response](#incident-response)
8. [Compliance Auditing](#compliance-auditing)

## Security Architecture

### Defense in Depth

#### Multi-Layer Security Model
```yaml
Security_Layers:
  1_Perimeter_Security:
    - Web Application Firewall (WAF)
    - DDoS Protection (AWS Shield/CloudFlare)
    - Geographic IP Filtering
    - Rate Limiting (API Gateway)
    
  2_Network_Security:
    - VPC with Private Subnets
    - Network Segmentation
    - Security Groups (Firewall Rules)
    - Network ACLs
    - VPN for Admin Access
    
  3_Identity_Security:
    - Multi-Factor Authentication (MFA)
    - Single Sign-On (SSO)
    - Role-Based Access Control (RBAC)
    - Principle of Least Privilege
    - Just-In-Time (JIT) Access
    
  4_Application_Security:
    - Input Validation & Sanitization
    - Output Encoding
    - CSRF Protection
    - SQL Injection Prevention
    - XSS Protection
    
  5_Data_Security:
    - Encryption at Rest (AES-256)
    - Encryption in Transit (TLS 1.3)
    - Key Management (AWS KMS/HashiCorp Vault)
    - Data Classification
    - Data Loss Prevention (DLP)
    
  6_Infrastructure_Security:
    - Container Security Scanning
    - Vulnerability Management
    - Security Hardening
    - Immutable Infrastructure
    - Security Monitoring & Logging
```

### Zero Trust Architecture

#### Implementation Framework
```typescript
// Zero Trust Identity Verification
interface ZeroTrustPolicy {
  identity: IdentityVerification;
  device: DeviceVerification;
  network: NetworkVerification;
  application: ApplicationVerification;
  data: DataClassification;
}

class ZeroTrustEnforcer {
  async verifyAccess(request: AccessRequest): Promise<AccessDecision> {
    const verification = await Promise.all([
      this.verifyIdentity(request.user),
      this.verifyDevice(request.device),
      this.verifyNetwork(request.source),
      this.verifyApplication(request.resource),
      this.classifyData(request.dataAccess)
    ]);
    
    const riskScore = this.calculateRiskScore(verification);
    const policy = await this.getPolicyForResource(request.resource);
    
    return this.makeAccessDecision(riskScore, policy, request);
  }
  
  private async verifyIdentity(user: User): Promise<IdentityScore> {
    const factors = await Promise.all([
      this.checkCredentials(user),
      this.checkMFA(user),
      this.checkBehavioralAnalytics(user),
      this.checkDeviceBinding(user)
    ]);
    
    return {
      score: this.calculateIdentityScore(factors),
      confidence: this.calculateConfidence(factors),
      factors
    };
  }
  
  private async verifyDevice(device: Device): Promise<DeviceScore> {
    return {
      trusted: await this.isDeviceTrusted(device),
      compliance: await this.checkDeviceCompliance(device),
      security: await this.assessDeviceSecurity(device)
    };
  }
  
  private calculateRiskScore(verification: VerificationResult[]): number {
    // Risk scoring algorithm based on multiple factors
    const weights = {
      identity: 0.3,
      device: 0.2,
      network: 0.2,
      application: 0.15,
      behavioral: 0.15
    };
    
    return verification.reduce((score, result, index) => {
      const weight = Object.values(weights)[index];
      return score + (result.score * weight);
    }, 0);
  }
}
```

### Secure Communication

#### TLS Configuration
```nginx
# nginx-security.conf
server {
    listen 443 ssl http2;
    server_name api.ggp-gfx.com;
    
    # SSL/TLS Configuration
    ssl_certificate /etc/ssl/certs/ggp-gfx.crt;
    ssl_certificate_key /etc/ssl/private/ggp-gfx.key;
    
    # Modern TLS configuration
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' wss: https:" always;
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    # DDoS protection
    client_body_timeout 10s;
    client_header_timeout 10s;
    client_max_body_size 10m;
    
    location / {
        proxy_pass http://api-gateway-service:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers for proxied requests
        proxy_hide_header X-Powered-By;
        proxy_hide_header Server;
    }
}
```

## Data Protection & Privacy

### Data Classification

#### Classification Schema
```yaml
Data_Classification:
  Public:
    Description: "Data intended for public consumption"
    Examples:
      - Marketing materials
      - Public API documentation
      - Published stream content
    Security_Controls:
      - Basic access logging
      - Standard backup procedures
    
  Internal:
    Description: "Data for internal business use"
    Examples:
      - Internal documentation
      - Business metrics
      - Employee information
    Security_Controls:
      - Employee access only
      - Encrypted storage
      - Access logging
    
  Confidential:
    Description: "Sensitive business data"
    Examples:
      - Customer data
      - Financial information
      - Source code
    Security_Controls:
      - Role-based access
      - Encryption at rest and in transit
      - Audit logging
      - Data Loss Prevention (DLP)
    
  Restricted:
    Description: "Highly sensitive data requiring special handling"
    Examples:
      - Payment card information
      - Personal identification data
      - Authentication credentials
    Security_Controls:
      - Strict access controls
      - Multi-factor authentication
      - Encryption with hardware security modules
      - Comprehensive audit trails
      - Data anonymization/pseudonymization
```

#### Data Handling Procedures
```typescript
class DataHandler {
  private classifier: DataClassifier;
  private encryptor: DataEncryptor;
  private auditor: AuditLogger;
  
  async processData(data: any, context: ProcessingContext): Promise<ProcessedData> {
    // Classify data based on content and context
    const classification = await this.classifier.classify(data, context);
    
    // Apply appropriate security controls
    const secureData = await this.applySecurityControls(data, classification);
    
    // Log data access for audit purposes
    await this.auditor.logDataAccess({
      userId: context.userId,
      dataType: classification.type,
      operation: context.operation,
      timestamp: new Date(),
      ipAddress: context.ipAddress
    });
    
    return secureData;
  }
  
  private async applySecurityControls(
    data: any, 
    classification: DataClassification
  ): Promise<any> {
    switch (classification.level) {
      case 'PUBLIC':
        return data;
        
      case 'INTERNAL':
        return await this.encryptor.encrypt(data, 'aes-256-gcm');
        
      case 'CONFIDENTIAL':
        const encrypted = await this.encryptor.encrypt(data, 'aes-256-gcm');
        return await this.addDigitalSignature(encrypted);
        
      case 'RESTRICTED':
        const hsmEncrypted = await this.encryptor.encryptWithHSM(data);
        const signed = await this.addDigitalSignature(hsmEncrypted);
        return await this.tokenizePersonalData(signed);
        
      default:
        throw new Error(`Unknown classification level: ${classification.level}`);
    }
  }
  
  private async tokenizePersonalData(data: any): Promise<any> {
    // Replace sensitive data with tokens
    const patterns = {
      email: /[\w\.-]+@[\w\.-]+\.\w+/g,
      phone: /\+?[\d\s\-\(\)]+/g,
      ssn: /\d{3}-\d{2}-\d{4}/g,
      creditCard: /\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/g
    };
    
    let tokenizedData = JSON.stringify(data);
    
    for (const [type, pattern] of Object.entries(patterns)) {
      tokenizedData = tokenizedData.replace(pattern, (match) => {
        return this.generateToken(type, match);
      });
    }
    
    return JSON.parse(tokenizedData);
  }
}
```

### Privacy by Design

#### GDPR Compliance Implementation
```typescript
interface PrivacyRequest {
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  userId: string;
  requesterId: string;
  reason?: string;
  scope?: string[];
}

class PrivacyManager {
  private dataStore: DataStore;
  private auditLogger: AuditLogger;
  private notificationService: NotificationService;
  
  async handlePrivacyRequest(request: PrivacyRequest): Promise<PrivacyResponse> {
    // Verify requester identity and authorization
    await this.verifyRequester(request);
    
    // Log the privacy request
    await this.auditLogger.logPrivacyRequest(request);
    
    switch (request.type) {
      case 'access':
        return await this.handleDataAccess(request);
      case 'rectification':
        return await this.handleDataRectification(request);
      case 'erasure':
        return await this.handleDataErasure(request);
      case 'portability':
        return await this.handleDataPortability(request);
      case 'restriction':
        return await this.handleProcessingRestriction(request);
      default:
        throw new Error(`Unsupported privacy request type: ${request.type}`);
    }
  }
  
  private async handleDataErasure(request: PrivacyRequest): Promise<PrivacyResponse> {
    const userData = await this.dataStore.findUserData(request.userId);
    
    // Check for legal obligations to retain data
    const retentionPolicies = await this.checkRetentionPolicies(request.userId);
    
    if (retentionPolicies.mustRetain) {
      return {
        status: 'partial',
        message: 'Some data must be retained due to legal obligations',
        retainedData: retentionPolicies.retainedData
      };
    }
    
    // Perform secure deletion
    const deletionResults = await Promise.all([
      this.dataStore.deleteUserData(request.userId),
      this.dataStore.anonymizeUserReferences(request.userId),
      this.purgeUserBackups(request.userId),
      this.notifyThirdParties(request.userId, 'deletion')
    ]);
    
    // Verify deletion
    const verificationResult = await this.verifyDeletion(request.userId);
    
    return {
      status: 'completed',
      deletionResults,
      verificationResult,
      completedAt: new Date()
    };
  }
  
  private async consentManagement(): Promise<void> {
    // Implement consent tracking and management
    const consentSchema = {
      userId: 'string',
      purposes: ['analytics', 'marketing', 'personalization'],
      timestamp: 'datetime',
      version: 'string',
      source: 'web' | 'mobile' | 'api',
      withdrawn: 'datetime?'
    };
    
    // Track consent for each processing purpose
    // Provide easy consent withdrawal mechanisms
    // Maintain audit trail of consent changes
  }
}
```

### Encryption Standards

#### Key Management System
```go
package security

import (
    "context"
    "crypto/rand"
    "encoding/base64"
    "fmt"
    
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/kms"
)

type KeyManager struct {
    kmsClient *kms.Client
    keyID     string
}

func NewKeyManager(keyID string) (*KeyManager, error) {
    cfg, err := config.LoadDefaultConfig(context.TODO())
    if err != nil {
        return nil, fmt.Errorf("failed to load AWS config: %w", err)
    }
    
    return &KeyManager{
        kmsClient: kms.NewFromConfig(cfg),
        keyID:     keyID,
    }, nil
}

func (km *KeyManager) GenerateDataKey(ctx context.Context) (*DataKey, error) {
    result, err := km.kmsClient.GenerateDataKey(ctx, &kms.GenerateDataKeyInput{
        KeyId:   &km.keyID,
        KeySpec: "AES_256",
    })
    if err != nil {
        return nil, fmt.Errorf("failed to generate data key: %w", err)
    }
    
    return &DataKey{
        PlaintextKey: result.Plaintext,
        EncryptedKey: result.CiphertextBlob,
    }, nil
}

func (km *KeyManager) DecryptDataKey(ctx context.Context, encryptedKey []byte) ([]byte, error) {
    result, err := km.kmsClient.Decrypt(ctx, &kms.DecryptInput{
        CiphertextBlob: encryptedKey,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to decrypt data key: %w", err)
    }
    
    return result.Plaintext, nil
}

// Envelope encryption implementation
type EnvelopeEncryption struct {
    keyManager *KeyManager
}

func (ee *EnvelopeEncryption) Encrypt(ctx context.Context, plaintext []byte) (*EncryptedData, error) {
    // Generate a data key for this encryption operation
    dataKey, err := ee.keyManager.GenerateDataKey(ctx)
    if err != nil {
        return nil, err
    }
    defer clearBytes(dataKey.PlaintextKey) // Zero out plaintext key
    
    // Encrypt data with the plaintext data key
    ciphertext, err := aesGCMEncrypt(plaintext, dataKey.PlaintextKey)
    if err != nil {
        return nil, err
    }
    
    return &EncryptedData{
        Ciphertext:   ciphertext,
        EncryptedKey: dataKey.EncryptedKey,
    }, nil
}

func (ee *EnvelopeEncryption) Decrypt(ctx context.Context, encrypted *EncryptedData) ([]byte, error) {
    // Decrypt the data key
    plaintextKey, err := ee.keyManager.DecryptDataKey(ctx, encrypted.EncryptedKey)
    if err != nil {
        return nil, err
    }
    defer clearBytes(plaintextKey) // Zero out key after use
    
    // Decrypt data with the plaintext data key
    return aesGCMDecrypt(encrypted.Ciphertext, plaintextKey)
}

func clearBytes(b []byte) {
    for i := range b {
        b[i] = 0
    }
}
```

## Compliance Requirements

### SOC 2 Type II Compliance

#### Control Framework Implementation
```yaml
SOC2_Controls:
  Security:
    CC6.1_Logical_Access:
      Description: "Logical access security measures"
      Implementation:
        - Multi-factor authentication required
        - Role-based access control (RBAC)
        - Regular access reviews
        - Privileged access management
      Evidence:
        - Access control policies
        - User access reports
        - MFA implementation
        - Privileged access logs
        
    CC6.2_Access_Restrictions:
      Description: "Access restrictions and monitoring"
      Implementation:
        - Principle of least privilege
        - Just-in-time access
        - Access request approval workflows
        - Automated access provisioning/deprovisioning
      Evidence:
        - Access request logs
        - Approval workflows
        - Deprovisioning reports
        
    CC6.3_Network_Security:
      Description: "Network security controls"
      Implementation:
        - Network segmentation
        - Firewall rules and monitoring
        - Intrusion detection systems
        - VPN for remote access
      Evidence:
        - Network architecture diagrams
        - Firewall configurations
        - IDS/IPS logs
        - VPN access logs

  Availability:
    A1.1_Capacity_Management:
      Description: "System capacity planning and monitoring"
      Implementation:
        - Auto-scaling policies
        - Capacity monitoring and alerting
        - Load testing procedures
        - Performance optimization
      Evidence:
        - Capacity planning documents
        - Monitoring dashboards
        - Load test results
        - Performance reports
        
    A1.2_Backup_Recovery:
      Description: "Data backup and recovery procedures"
      Implementation:
        - Automated daily backups
        - Backup integrity testing
        - Disaster recovery procedures
        - Recovery time objectives (RTO)
      Evidence:
        - Backup schedules and logs
        - Recovery test results
        - DR procedures
        - RTO/RPO measurements

  Processing_Integrity:
    PI1.1_Data_Validation:
      Description: "Input data validation and processing controls"
      Implementation:
        - Input validation frameworks
        - Data integrity checks
        - Processing error handling
        - Transaction logging
      Evidence:
        - Validation rule documentation
        - Error handling procedures
        - Transaction logs
        - Data integrity reports
```

#### Audit Evidence Collection
```typescript
class ComplianceAuditor {
  private evidenceStore: EvidenceStore;
  private reportGenerator: ReportGenerator;
  
  async collectSOC2Evidence(): Promise<ComplianceReport> {
    const evidence = await Promise.all([
      this.collectSecurityEvidence(),
      this.collectAvailabilityEvidence(),
      this.collectProcessingIntegrityEvidence(),
      this.collectConfidentialityEvidence(),
      this.collectPrivacyEvidence()
    ]);
    
    return this.reportGenerator.generateSOC2Report(evidence);
  }
  
  private async collectSecurityEvidence(): Promise<SecurityEvidence> {
    return {
      accessControlLogs: await this.getAccessControlLogs(),
      authenticationLogs: await this.getAuthenticationLogs(),
      networkSecurityConfigs: await this.getNetworkConfigurations(),
      vulnerabilityScans: await this.getVulnerabilityScans(),
      securityIncidents: await this.getSecurityIncidents(),
      policyDocuments: await this.getPolicyDocuments()
    };
  }
  
  private async collectAvailabilityEvidence(): Promise<AvailabilityEvidence> {
    const timeRange = { start: this.getAuditPeriodStart(), end: this.getAuditPeriodEnd() };
    
    return {
      uptimeMetrics: await this.getUptimeMetrics(timeRange),
      performanceMetrics: await this.getPerformanceMetrics(timeRange),
      backupLogs: await this.getBackupLogs(timeRange),
      recoveryTests: await this.getRecoveryTestResults(timeRange),
      incidentReports: await this.getIncidentReports(timeRange),
      capacityReports: await this.getCapacityReports(timeRange)
    };
  }
  
  async generateComplianceReport(): Promise<ComplianceReport> {
    const controlsAssessment = await this.assessControls();
    const gapAnalysis = await this.performGapAnalysis();
    const recommendations = await this.generateRecommendations();
    
    return {
      reportDate: new Date(),
      auditPeriod: this.getAuditPeriod(),
      controlsAssessment,
      gapAnalysis,
      recommendations,
      evidenceIndex: await this.generateEvidenceIndex()
    };
  }
}
```

### GDPR Compliance

#### Data Protection Impact Assessment
```yaml
DPIA_Assessment:
  Project: "GGP-GFX Platform"
  Date: "2025-08-01"
  
  Data_Processing_Overview:
    Personal_Data_Categories:
      - Contact information (email, name)
      - User account data
      - Usage analytics
      - Payment information
      - Stream content metadata
      
    Processing_Purposes:
      - Service provision
      - User authentication
      - Payment processing
      - Analytics and improvements
      - Customer support
      
    Legal_Basis:
      - Contract performance
      - Legitimate interests
      - Consent (analytics)
      - Legal obligation (financial records)
    
  Risk_Assessment:
    High_Risk_Processing:
      - Payment card processing
      - Cross-border data transfers
      - Automated decision making
      
    Risk_Mitigation:
      - PCI DSS compliance for payments
      - Standard contractual clauses for transfers
      - Human review for critical decisions
      
  Privacy_Safeguards:
    Technical_Measures:
      - Encryption at rest and in transit
      - Access controls and authentication
      - Data minimization principles
      - Automated data retention policies
      
    Organizational_Measures:
      - Privacy by design principles
      - Staff training programs
      - Data breach response procedures
      - Regular privacy audits
```

### PCI DSS Compliance

#### Payment Security Implementation
```typescript
class PaymentProcessor {
  private tokenizer: CardTokenizer;
  private encryptor: PaymentEncryptor;
  private auditor: PaymentAuditor;
  
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    // PCI DSS Requirement 3: Protect stored cardholder data
    const sanitizedData = this.sanitizePaymentData(paymentData);
    
    // PCI DSS Requirement 4: Encrypt transmission of cardholder data
    const encryptedData = await this.encryptor.encrypt(sanitizedData);
    
    // PCI DSS Requirement 8: Identify and authenticate access
    await this.authenticateUser(paymentData.userId);
    
    // Process payment through compliant gateway
    const result = await this.paymentGateway.process(encryptedData);
    
    // PCI DSS Requirement 10: Track and monitor all access
    await this.auditor.logPaymentTransaction({
      userId: paymentData.userId,
      amount: paymentData.amount,
      timestamp: new Date(),
      result: result.status,
      tokenReference: result.tokenId
    });
    
    return result;
  }
  
  private sanitizePaymentData(data: PaymentRequest): SanitizedPaymentData {
    // Remove or mask sensitive card data
    return {
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      // Card data is tokenized, not stored
      cardToken: this.tokenizer.tokenize(data.cardData),
      merchantId: data.merchantId
    };
  }
  
  // PCI DSS Requirement 3.4: Render cardholder data unreadable
  private maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  }
}

// Network segmentation for PCI compliance
const pciNetworkSegmentation = {
  cardholderDataEnvironment: {
    subnets: ['10.0.10.0/24'], // Isolated subnet
    firewallRules: [
      'DENY ALL by default',
      'ALLOW HTTPS from web tier',
      'ALLOW specific database ports from app tier',
      'LOG ALL connections'
    ],
    monitoring: 'Enhanced logging and intrusion detection'
  },
  
  nonCDE: {
    subnets: ['10.0.20.0/24', '10.0.30.0/24'],
    firewallRules: [
      'ALLOW standard business traffic',
      'DENY direct access to CDE'
    ]
  }
};
```

## Licensing System

### License Management Architecture

#### Subscription and Licensing Service
```typescript
interface LicenseSubscription {
  id: string;
  userId: string;
  planType: 'free' | 'pro' | 'enterprise';
  features: LicenseFeature[];
  validFrom: Date;
  validUntil: Date;
  maxUsers: number;
  maxStreams: number;
  cloudProcessingMinutes: number;
  status: 'active' | 'suspended' | 'expired' | 'cancelled';
}

interface LicenseFeature {
  name: string;
  enabled: boolean;
  limits?: FeatureLimits;
}

class LicenseManager {
  private subscriptionStore: SubscriptionStore;
  private usageTracker: UsageTracker;
  private licenseValidator: LicenseValidator;
  
  async validateLicense(userId: string, feature: string): Promise<LicenseValidation> {
    const subscription = await this.subscriptionStore.getActiveSubscription(userId);
    
    if (!subscription) {
      return {
        valid: false,
        reason: 'No active subscription',
        allowedUsage: this.getFreeFeatures()
      };
    }
    
    // Check subscription validity
    if (subscription.validUntil < new Date()) {
      return {
        valid: false,
        reason: 'Subscription expired',
        expiredAt: subscription.validUntil
      };
    }
    
    // Check feature availability
    const featureConfig = subscription.features.find(f => f.name === feature);
    if (!featureConfig || !featureConfig.enabled) {
      return {
        valid: false,
        reason: 'Feature not included in subscription',
        availableFeatures: subscription.features.filter(f => f.enabled)
      };
    }
    
    // Check usage limits
    const currentUsage = await this.usageTracker.getCurrentUsage(userId, feature);
    const usageValid = await this.validateUsageLimits(currentUsage, featureConfig.limits);
    
    if (!usageValid.valid) {
      return {
        valid: false,
        reason: 'Usage limit exceeded',
        currentUsage,
        limits: featureConfig.limits
      };
    }
    
    return {
      valid: true,
      subscription,
      remainingUsage: usageValid.remaining
    };
  }
  
  async trackUsage(userId: string, feature: string, usage: UsageMetric): Promise<void> {
    // Validate license before tracking usage
    const validation = await this.validateLicense(userId, feature);
    if (!validation.valid) {
      throw new LicenseViolationError(validation.reason);
    }
    
    // Record usage
    await this.usageTracker.recordUsage({
      userId,
      feature,
      usage,
      timestamp: new Date(),
      subscriptionId: validation.subscription.id
    });
    
    // Check if approaching limits
    const currentUsage = await this.usageTracker.getCurrentUsage(userId, feature);
    const limits = validation.subscription.features.find(f => f.name === feature)?.limits;
    
    if (limits && this.isApproachingLimit(currentUsage, limits)) {
      await this.notifyUsageWarning(userId, feature, currentUsage, limits);
    }
  }
  
  private async validateUsageLimits(
    currentUsage: UsageMetric, 
    limits?: FeatureLimits
  ): Promise<UsageValidation> {
    if (!limits) {
      return { valid: true, remaining: Infinity };
    }
    
    switch (limits.type) {
      case 'monthly':
        const monthlyUsage = await this.getMonthlyUsage(currentUsage);
        return {
          valid: monthlyUsage <= limits.value,
          remaining: Math.max(0, limits.value - monthlyUsage)
        };
        
      case 'concurrent':
        const concurrentUsage = await this.getConcurrentUsage(currentUsage);
        return {
          valid: concurrentUsage <= limits.value,
          remaining: Math.max(0, limits.value - concurrentUsage)
        };
        
      case 'total':
        return {
          valid: currentUsage.total <= limits.value,
          remaining: Math.max(0, limits.value - currentUsage.total)
        };
        
      default:
        return { valid: true, remaining: Infinity };
    }
  }
}

// License enforcement middleware
class LicenseMiddleware {
  constructor(private licenseManager: LicenseManager) {}
  
  requireFeature(featureName: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        
        const validation = await this.licenseManager.validateLicense(userId, featureName);
        
        if (!validation.valid) {
          return res.status(403).json({
            error: 'License validation failed',
            reason: validation.reason,
            upgradeUrl: '/upgrade'
          });
        }
        
        // Attach license info to request
        req.license = validation;
        next();
      } catch (error) {
        return res.status(500).json({ error: 'License validation error' });
      }
    };
  }
}

// Usage tracking for billing
class UsageTracker {
  private metricsStore: MetricsStore;
  
  async recordUsage(usage: UsageRecord): Promise<void> {
    await this.metricsStore.record({
      timestamp: usage.timestamp,
      userId: usage.userId,
      feature: usage.feature,
      metric: usage.usage,
      subscriptionId: usage.subscriptionId,
      metadata: {
        sessionId: usage.sessionId,
        resourceId: usage.resourceId
      }
    });
    
    // Real-time usage aggregation for billing
    await this.updateUsageAggregates(usage);
  }
  
  private async updateUsageAggregates(usage: UsageRecord): Promise<void> {
    const aggregationKeys = [
      `user:${usage.userId}:monthly`,
      `user:${usage.userId}:daily`,
      `subscription:${usage.subscriptionId}:monthly`,
      `feature:${usage.feature}:monthly`
    ];
    
    await Promise.all(
      aggregationKeys.map(key => 
        this.metricsStore.incrementAggregate(key, usage.usage.value)
      )
    );
  }
}
```

### Software Licensing Compliance

#### Open Source License Management
```yaml
License_Compliance_Framework:
  Approved_Licenses:
    Permissive:
      - MIT
      - Apache-2.0
      - BSD-3-Clause
      - ISC
    
    Copyleft_Restricted:
      - GPL-2.0 (with legal review)
      - GPL-3.0 (with legal review)
      - LGPL-2.1 (libraries only)
    
    Prohibited:
      - AGPL-3.0
      - GPL with proprietary exception
      - Custom restrictive licenses
  
  License_Scanning:
    Tools:
      - FOSSA (automated scanning)
      - WhiteSource Bolt
      - License Checker (npm/yarn)
      - cargo-license (Rust)
    
    Process:
      - Automated scan on every build
      - Legal review for new licenses
      - Regular compliance audits
      - Violation remediation tracking
  
  Attribution_Requirements:
    Notice_File: "THIRD_PARTY_NOTICES.txt"
    License_Copies: "licenses/"
    Attribution_Format: "Component - License - Copyright"
    Update_Frequency: "Every release"
```

## Threat Modeling

### STRIDE Analysis

#### Threat Identification Matrix
```yaml
STRIDE_Analysis:
  Spoofing:
    Threats:
      - Impersonation of legitimate users
      - Fake authentication tokens
      - Man-in-the-middle attacks
    Mitigations:
      - Multi-factor authentication
      - Certificate pinning
      - Mutual TLS authentication
      - Token signature verification
  
  Tampering:
    Threats:
      - Code injection attacks
      - Database manipulation
      - Configuration file modification
      - Stream content alteration
    Mitigations:
      - Input validation and sanitization
      - Code signing
      - Database integrity constraints
      - Content-based signatures
  
  Repudiation:
    Threats:
      - Users denying actions
      - Missing audit trails
      - Log tampering
    Mitigations:
      - Comprehensive audit logging
      - Digital signatures
      - Immutable log storage
      - Non-repudiation protocols
  
  Information_Disclosure:
    Threats:
      - Unauthorized data access
      - Data breaches
      - Side-channel attacks
      - Metadata leakage
    Mitigations:
      - Encryption at rest and in transit
      - Access controls
      - Data masking
      - Secure coding practices
  
  Denial_of_Service:
    Threats:
      - DDoS attacks
      - Resource exhaustion
      - Application-layer attacks
      - Infrastructure overload
    Mitigations:
      - DDoS protection services
      - Rate limiting
      - Resource quotas
      - Circuit breakers
  
  Elevation_of_Privilege:
    Threats:
      - Privilege escalation
      - Authorization bypass
      - Container breakouts
      - Kernel exploits
    Mitigations:
      - Principle of least privilege
      - Role-based access control
      - Container security
      - Regular security updates
```

### Attack Surface Analysis

#### Surface Area Mapping
```typescript
interface AttackSurface {
  webInterface: WebAttackVectors;
  apiEndpoints: APIAttackVectors;
  mobileApps: MobileAttackVectors;
  infrastructure: InfrastructureAttackVectors;
  thirdPartyIntegrations: ThirdPartyAttackVectors;
}

class AttackSurfaceAnalyzer {
  async analyzeWebInterface(): Promise<WebAttackVectors> {
    return {
      inputFields: await this.scanInputValidation(),
      authenticationFlows: await this.analyzeAuthFlows(),
      sessionManagement: await this.auditSessionHandling(),
      contentSecurityPolicy: await this.validateCSP(),
      crossOriginRequests: await this.analyzeCORS()
    };
  }
  
  async analyzeAPIEndpoints(): Promise<APIAttackVectors> {
    const endpoints = await this.discoverEndpoints();
    
    return {
      authenticationBypass: await this.testAuthBypass(endpoints),
      inputValidation: await this.testInputValidation(endpoints),
      rateLimiting: await this.testRateLimits(endpoints),
      dataExfiltration: await this.testDataLeakage(endpoints),
      injectionVulnerabilities: await this.testInjections(endpoints)
    };
  }
  
  private async testInjections(endpoints: APIEndpoint[]): Promise<InjectionTest[]> {
    const tests = [];
    
    for (const endpoint of endpoints) {
      // SQL Injection testing
      const sqlTests = await this.testSQLInjection(endpoint);
      
      // NoSQL Injection testing
      const nosqlTests = await this.testNoSQLInjection(endpoint);
      
      // Command Injection testing
      const cmdTests = await this.testCommandInjection(endpoint);
      
      // LDAP Injection testing
      const ldapTests = await this.testLDAPInjection(endpoint);
      
      tests.push(...sqlTests, ...nosqlTests, ...cmdTests, ...ldapTests);
    }
    
    return tests;
  }
}

// Automated security testing
class SecurityTestSuite {
  async runComprehensiveTests(): Promise<SecurityTestResults> {
    const results = await Promise.all([
      this.runOWASPZAPScan(),
      this.runBurpSuiteScan(),
      this.runNessusVulnScan(),
      this.runCustomSecurityTests(),
      this.runDependencySecurityScan()
    ]);
    
    return this.aggregateResults(results);
  }
  
  private async runOWASPZAPScan(): Promise<ZAPScanResult> {
    // Integration with OWASP ZAP for automated security scanning
    const zapClient = new ZAPClient(process.env.ZAP_API_URL);
    
    await zapClient.spider('https://api.ggp-gfx.com');
    await zapClient.activeScan('https://api.ggp-gfx.com');
    
    return await zapClient.getResults();
  }
}
```

## Security Monitoring

### SIEM Integration

#### Security Information and Event Management
```yaml
# Elasticsearch SIEM Configuration
SIEM_Configuration:
  Data_Sources:
    Application_Logs:
      - Authentication events
      - Authorization failures
      - API access logs
      - Error logs
      
    Infrastructure_Logs:
      - System logs
      - Network traffic
      - Container logs
      - Kubernetes audit logs
      
    Security_Tools:
      - WAF logs
      - IDS/IPS alerts
      - Vulnerability scan results
      - Antivirus detections
  
  Detection_Rules:
    Failed_Authentication:
      Query: "event.category:authentication AND event.outcome:failure"
      Threshold: 5 failures in 5 minutes
      Severity: Medium
      
    Privilege_Escalation:
      Query: "event.category:process AND process.name:sudo"
      Filter: "user.name NOT IN allowed_sudo_users"
      Severity: High
      
    Suspicious_API_Access:
      Query: "http.response.status_code:200 AND url.path:/api/admin/*"
      Filter: "source.ip NOT IN admin_ip_ranges"
      Severity: High
      
    Data_Exfiltration:
      Query: "http.response.bytes > 10000000"
      Threshold: 3 large responses in 1 minute
      Severity: Critical
```

#### Real-time Threat Detection
```python
# Security monitoring service
import asyncio
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class SecurityEvent:
    timestamp: datetime
    event_type: str
    severity: str
    source_ip: str
    user_id: str
    details: Dict[str, Any]

class ThreatDetectionEngine:
    def __init__(self):
        self.detection_rules = self.load_detection_rules()
        self.threat_intelligence = ThreatIntelligenceService()
        self.incident_manager = IncidentManager()
        
    async def process_event(self, event: SecurityEvent) -> None:
        """Process security events in real-time"""
        # Enrich event with threat intelligence
        enriched_event = await self.enrich_event(event)
        
        # Apply detection rules
        detections = await self.apply_detection_rules(enriched_event)
        
        # Correlate with other events
        correlations = await self.correlate_events(enriched_event)
        
        # Generate alerts if thresholds are met
        if detections or correlations:
            await self.generate_alert(enriched_event, detections, correlations)
    
    async def enrich_event(self, event: SecurityEvent) -> SecurityEvent:
        """Enrich events with external threat intelligence"""
        # Check IP reputation
        ip_reputation = await self.threat_intelligence.check_ip(event.source_ip)
        
        # Check for known attack patterns
        attack_patterns = await self.threat_intelligence.check_patterns(event.details)
        
        # Add geolocation data
        geolocation = await self.threat_intelligence.geolocate_ip(event.source_ip)
        
        event.details.update({
            'ip_reputation': ip_reputation,
            'attack_patterns': attack_patterns,
            'geolocation': geolocation
        })
        
        return event
    
    async def apply_detection_rules(self, event: SecurityEvent) -> List[Detection]:
        """Apply behavioral and signature-based detection rules"""
        detections = []
        
        for rule in self.detection_rules:
            if await rule.matches(event):
                detection = Detection(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.severity,
                    event=event,
                    timestamp=datetime.utcnow()
                )
                detections.append(detection)
        
        return detections
    
    async def correlate_events(self, event: SecurityEvent) -> List[Correlation]:
        """Correlate events to detect complex attack patterns"""
        correlations = []
        
        # Time-based correlation window
        time_window = timedelta(minutes=15)
        related_events = await self.get_related_events(event, time_window)
        
        # Check for known attack chains
        attack_chains = [
            self.detect_credential_stuffing,
            self.detect_lateral_movement,
            self.detect_data_exfiltration_pattern,
            self.detect_privilege_escalation_chain
        ]
        
        for detector in attack_chains:
            correlation = await detector(event, related_events)
            if correlation:
                correlations.append(correlation)
        
        return correlations
    
    async def detect_credential_stuffing(
        self, 
        event: SecurityEvent, 
        related_events: List[SecurityEvent]
    ) -> Optional[Correlation]:
        """Detect credential stuffing attacks"""
        if event.event_type != 'authentication_failure':
            return None
        
        # Look for multiple failed logins from same IP
        failed_logins = [
            e for e in related_events 
            if e.event_type == 'authentication_failure' 
            and e.source_ip == event.source_ip
        ]
        
        if len(failed_logins) >= 10:  # Threshold for credential stuffing
            return Correlation(
                type='credential_stuffing',
                severity='high',
                description=f'Detected {len(failed_logins)} failed login attempts from {event.source_ip}',
                events=failed_logins + [event]
            )
        
        return None

class IncidentResponseAutomation:
    """Automated incident response system"""
    
    async def handle_high_severity_alert(self, alert: SecurityAlert) -> None:
        """Automated response to high severity security alerts"""
        response_actions = []
        
        if alert.type == 'brute_force_attack':
            # Automatically block attacking IP
            await self.block_ip_address(alert.source_ip)
            response_actions.append(f"Blocked IP {alert.source_ip}")
            
        elif alert.type == 'malware_detection':
            # Isolate affected systems
            await self.isolate_system(alert.affected_system)
            response_actions.append(f"Isolated system {alert.affected_system}")
            
        elif alert.type == 'data_exfiltration':
            # Emergency data access restriction
            await self.restrict_data_access(alert.user_id)
            response_actions.append(f"Restricted data access for user {alert.user_id}")
        
        # Create incident ticket
        incident = await self.create_incident_ticket(alert, response_actions)
        
        # Notify security team
        await self.notify_security_team(incident)
        
        # Update threat intelligence
        await self.update_threat_indicators(alert)
```

### Vulnerability Management

#### Continuous Security Assessment
```yaml
# Vulnerability scanning pipeline
Vulnerability_Management:
  Scanning_Schedule:
    Infrastructure:
      Frequency: Weekly
      Tools:
        - Nessus Professional
        - OpenVAS
        - AWS Inspector
      Scope:
        - All EC2 instances
        - RDS databases
        - Load balancers
        - Container images
    
    Applications:
      Frequency: Daily (on commits)
      Tools:
        - OWASP ZAP
        - SonarQube Security
        - Snyk
        - GitHub Security Advisories
      Scope:
        - Source code
        - Dependencies
        - Container images
        - Running applications
    
    Dependencies:
      Frequency: Real-time monitoring
      Tools:
        - Dependabot
        - Snyk
        - npm audit
        - cargo audit
      Scope:
        - Package dependencies
        - Container base images
        - Third-party libraries
  
  Remediation_SLAs:
    Critical: 24 hours
    High: 7 days
    Medium: 30 days
    Low: 90 days
  
  Patch_Management:
    Automated_Patching:
      - Security updates for base images
      - Dependency updates (minor versions)
      - OS security patches
    
    Manual_Review_Required:
      - Major version updates
      - Breaking changes
      - Custom application patches
```

## Incident Response

### Security Incident Response Plan

#### Incident Classification and Response
```yaml
Incident_Response_Plan:
  Incident_Categories:
    Category_1_Critical:
      Examples:
        - Active data breach
        - Ransomware attack
        - Complete system compromise
      Response_Time: Immediate (15 minutes)
      Team: Full incident response team
      Authority: CISO, CEO notification required
      
    Category_2_High:
      Examples:
        - Suspected unauthorized access
        - Malware detection
        - DDoS attack
      Response_Time: 1 hour
      Team: Security team + relevant engineering
      Authority: CISO notification required
      
    Category_3_Medium:
      Examples:
        - Failed security controls
        - Suspicious network activity
        - Policy violations
      Response_Time: 4 hours
      Team: Security team
      Authority: Security manager notification
      
    Category_4_Low:
      Examples:
        - Security tool alerts
        - Minor policy violations
        - Information gathering attempts
      Response_Time: 24 hours
      Team: Security analyst
      Authority: Standard escalation
  
  Response_Phases:
    1_Preparation:
      - Incident response team training
      - Playbook development and testing
      - Tool and process preparation
      - Communication plan establishment
      
    2_Detection_Analysis:
      - Security monitoring and alerting
      - Initial triage and classification
      - Evidence collection and preservation
      - Impact assessment
      
    3_Containment_Eradication:
      - Immediate containment actions
      - System isolation if necessary
      - Threat removal and remediation
      - Vulnerability patching
      
    4_Recovery:
      - System restoration
      - Service resumption
      - Enhanced monitoring
      - Validation testing
      
    5_Post_Incident:
      - Incident documentation
      - Lessons learned analysis
      - Process improvement
      - Legal and regulatory reporting
```

#### Automated Incident Response
```python
class AutomatedIncidentResponse:
    def __init__(self):
        self.playbooks = self.load_playbooks()
        self.notification_service = NotificationService()
        self.isolation_service = IsolationService()
        self.evidence_collector = EvidenceCollector()
    
    async def handle_incident(self, alert: SecurityAlert) -> IncidentResponse:
        """Main incident response orchestration"""
        
        # 1. Initial classification
        classification = await self.classify_incident(alert)
        
        # 2. Create incident record
        incident = await self.create_incident(alert, classification)
        
        # 3. Execute automated response
        response_actions = await self.execute_playbook(incident)
        
        # 4. Collect evidence
        evidence = await self.collect_evidence(incident)
        
        # 5. Notify stakeholders
        await self.notify_stakeholders(incident, classification)
        
        # 6. Monitor and track
        await self.start_incident_tracking(incident)
        
        return IncidentResponse(
            incident_id=incident.id,
            classification=classification,
            actions_taken=response_actions,
            evidence_collected=evidence,
            status='in_progress'
        )
    
    async def execute_playbook(self, incident: SecurityIncident) -> List[ResponseAction]:
        """Execute incident-specific response playbook"""
        playbook = self.playbooks.get(incident.type)
        if not playbook:
            playbook = self.playbooks['default']
        
        actions = []
        
        for step in playbook.steps:
            try:
                if step.condition(incident):
                    result = await step.execute(incident)
                    actions.append(ResponseAction(
                        step=step.name,
                        result=result,
                        timestamp=datetime.utcnow(),
                        success=True
                    ))
            except Exception as e:
                actions.append(ResponseAction(
                    step=step.name,
                    error=str(e),
                    timestamp=datetime.utcnow(),
                    success=False
                ))
        
        return actions
    
    async def collect_evidence(self, incident: SecurityIncident) -> Evidence:
        """Automated evidence collection"""
        evidence_tasks = [
            self.evidence_collector.collect_logs(incident.time_range),
            self.evidence_collector.collect_network_data(incident.source_ip),
            self.evidence_collector.collect_system_state(incident.affected_systems),
            self.evidence_collector.collect_user_activity(incident.user_id)
        ]
        
        evidence_data = await asyncio.gather(*evidence_tasks)
        
        return Evidence(
            incident_id=incident.id,
            collection_timestamp=datetime.utcnow(),
            logs=evidence_data[0],
            network_data=evidence_data[1],
            system_state=evidence_data[2],
            user_activity=evidence_data[3],
            chain_of_custody=self.generate_custody_record()
        )

# Incident response playbooks
class BruteForcePlaybook:
    """Playbook for brute force attack incidents"""
    
    async def execute(self, incident: SecurityIncident) -> List[str]:
        actions = []
        
        # 1. Block attacking IP
        await self.block_ip(incident.source_ip)
        actions.append(f"Blocked IP {incident.source_ip}")
        
        # 2. Review affected accounts
        affected_accounts = await self.get_affected_accounts(incident)
        for account in affected_accounts:
            if await self.is_account_compromised(account):
                await self.disable_account(account)
                actions.append(f"Disabled compromised account {account}")
        
        # 3. Enhance monitoring
        await self.enhance_monitoring(incident.source_ip)
        actions.append("Enhanced monitoring activated")
        
        return actions

class DataBreachPlaybook:
    """Playbook for data breach incidents"""
    
    async def execute(self, incident: SecurityIncident) -> List[str]:
        actions = []
        
        # 1. Immediate containment
        await self.isolate_affected_systems(incident.affected_systems)
        actions.append("Isolated affected systems")
        
        # 2. Assess data exposure
        exposed_data = await self.assess_data_exposure(incident)
        actions.append(f"Assessed exposure: {exposed_data.summary}")
        
        # 3. Legal notification requirements
        if exposed_data.contains_pii:
            await self.trigger_breach_notification_process(exposed_data)
            actions.append("Initiated breach notification process")
        
        # 4. Preserve evidence
        await self.preserve_forensic_evidence(incident)
        actions.append("Forensic evidence preserved")
        
        return actions
```

## Compliance Auditing

### Automated Compliance Monitoring

#### Continuous Compliance Assessment
```python
class ComplianceMonitor:
    """Continuous compliance monitoring system"""
    
    def __init__(self):
        self.compliance_frameworks = {
            'SOC2': SOC2Assessor(),
            'GDPR': GDPRAssessor(),
            'PCI_DSS': PCIDSSAssessor(),
            'ISO27001': ISO27001Assessor()
        }
        
    async def run_compliance_assessment(self, framework: str) -> ComplianceReport:
        """Run comprehensive compliance assessment"""
        assessor = self.compliance_frameworks.get(framework)
        if not assessor:
            raise ValueError(f"Unsupported framework: {framework}")
        
        # Collect evidence
        evidence = await self.collect_compliance_evidence(framework)
        
        # Run assessment
        assessment_results = await assessor.assess(evidence)
        
        # Generate recommendations
        recommendations = await assessor.generate_recommendations(assessment_results)
        
        # Create report
        report = ComplianceReport(
            framework=framework,
            assessment_date=datetime.utcnow(),
            results=assessment_results,
            recommendations=recommendations,
            evidence_index=evidence.index,
            next_assessment_due=self.calculate_next_assessment_date(framework)
        )
        
        # Store for audit trail
        await self.store_compliance_report(report)
        
        return report
    
    async def collect_compliance_evidence(self, framework: str) -> ComplianceEvidence:
        """Collect evidence for compliance assessment"""
        
        evidence_collectors = {
            'access_controls': self.collect_access_control_evidence,
            'encryption': self.collect_encryption_evidence,
            'monitoring': self.collect_monitoring_evidence,
            'incident_response': self.collect_incident_response_evidence,
            'vulnerability_management': self.collect_vuln_mgmt_evidence,
            'data_protection': self.collect_data_protection_evidence
        }
        
        evidence = {}
        for category, collector in evidence_collectors.items():
            evidence[category] = await collector()
        
        return ComplianceEvidence(
            framework=framework,
            collection_date=datetime.utcnow(),
            evidence=evidence,
            index=self.generate_evidence_index(evidence)
        )

class SOC2Assessor:
    """SOC 2 Type II compliance assessor"""
    
    async def assess_security_controls(self, evidence: dict) -> SecurityAssessment:
        """Assess security controls (CC6.x)"""
        
        controls_assessment = {}
        
        # CC6.1 - Logical and physical access controls
        controls_assessment['CC6.1'] = await self.assess_access_controls(
            evidence['access_controls']
        )
        
        # CC6.2 - Access control management
        controls_assessment['CC6.2'] = await self.assess_access_management(
            evidence['access_controls']
        )
        
        # CC6.3 - Network controls
        controls_assessment['CC6.3'] = await self.assess_network_controls(
            evidence['monitoring']
        )
        
        # CC6.6 - Logical access security measures
        controls_assessment['CC6.6'] = await self.assess_logical_access(
            evidence['access_controls']
        )
        
        # CC6.7 - Data transmission controls
        controls_assessment['CC6.7'] = await self.assess_data_transmission(
            evidence['encryption']
        )
        
        # CC6.8 - System component controls
        controls_assessment['CC6.8'] = await self.assess_system_components(
            evidence['vulnerability_management']
        )
        
        return SecurityAssessment(
            controls=controls_assessment,
            overall_rating=self.calculate_overall_rating(controls_assessment),
            gaps=self.identify_control_gaps(controls_assessment),
            recommendations=self.generate_security_recommendations(controls_assessment)
        )
    
    async def assess_access_controls(self, evidence: dict) -> ControlAssessment:
        """Assess access control implementation"""
        
        # Check MFA implementation
        mfa_coverage = evidence.get('mfa_coverage', 0)
        mfa_compliant = mfa_coverage >= 0.95  # 95% coverage required
        
        # Check privileged access management
        privileged_accounts = evidence.get('privileged_accounts', [])
        pam_compliant = all(
            account.get('requires_approval') and account.get('time_limited')
            for account in privileged_accounts
        )
        
        # Check access reviews
        last_access_review = evidence.get('last_access_review')
        review_compliant = (
            last_access_review and 
            (datetime.utcnow() - last_access_review).days <= 90
        )
        
        deficiencies = []
        if not mfa_compliant:
            deficiencies.append(f"MFA coverage is {mfa_coverage*100:.1f}%, below required 95%")
        if not pam_compliant:
            deficiencies.append("Privileged access management controls incomplete")
        if not review_compliant:
            deficiencies.append("Access reviews not performed within required timeframe")
        
        return ControlAssessment(
            control_id='CC6.1',
            compliant=mfa_compliant and pam_compliant and review_compliant,
            deficiencies=deficiencies,
            evidence_references=list(evidence.keys())
        )

# Automated compliance reporting
class ComplianceReporter:
    """Generate compliance reports and dashboards"""
    
    async def generate_executive_dashboard(self) -> ComplianceDashboard:
        """Generate executive compliance dashboard"""
        
        frameworks = ['SOC2', 'GDPR', 'PCI_DSS', 'ISO27001']
        compliance_status = {}
        
        for framework in frameworks:
            latest_assessment = await self.get_latest_assessment(framework)
            compliance_status[framework] = {
                'overall_rating': latest_assessment.overall_rating,
                'compliant_controls': latest_assessment.compliant_controls,
                'total_controls': latest_assessment.total_controls,
                'last_assessment': latest_assessment.date,
                'next_assessment': latest_assessment.next_due,
                'critical_gaps': latest_assessment.critical_gaps
            }
        
        return ComplianceDashboard(
            generated_at=datetime.utcnow(),
            frameworks=compliance_status,
            overall_health=self.calculate_overall_compliance_health(compliance_status),
            upcoming_audits=await self.get_upcoming_audits(),
            action_items=await self.get_priority_action_items()
        )
```

---

Next: [Project Management →](10-project-management.md)