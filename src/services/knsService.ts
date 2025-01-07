// Types for API responses
interface KNSDomainOwnerResponse {
  success: boolean;
  data: {
    assetId: string;
    asset: string;
    owner: string;
  };
}

interface KNSAsset {
  id: string;
  assetId: string;
  mimeType: string;
  asset: string;
  owner: string;
  isDomain: boolean;
  isVerifiedDomain: boolean;
  creationBlockTime: string;
}

interface KNSPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface KNSAssetsResponse {
  success: boolean;
  data: {
    assets: KNSAsset[];
    pagination: KNSPagination;
  };
}

const KNS_API_BASE = 'https://api.knsdomains.org/tn10/api/v1';

export const knsService = {
  /**
   * Get the owner information for a KNS domain
   * @param domain - The domain name to look up
   */
  async getDomainOwner(domain: string): Promise<KNSDomainOwnerResponse> {
    try {
      const response = await fetch(`${KNS_API_BASE}/${domain}/owner`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as KNSDomainOwnerResponse;
      return data;
    } catch (error) {
      console.error('Error fetching domain owner:', error);
      throw error;
    }
  },

  /**
   * Get all assets owned by a specific address
   * @param owner - The Kaspa address of the owner
   */
  async getAssetsByOwner(owner: string): Promise<KNSAssetsResponse> {
    try {
      const params = new URLSearchParams({
        owner: owner,
        page: '1',
        pageSize: '100'
      });

      const response = await fetch(`${KNS_API_BASE}/assets?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as KNSAssetsResponse;
      return data;
    } catch (error) {
      console.error('Error fetching assets by owner:', error);
      throw error;
    }
  }
};

export type { KNSDomainOwnerResponse, KNSAsset, KNSAssetsResponse, KNSPagination }; 