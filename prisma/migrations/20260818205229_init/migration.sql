-- CreateTable
CREATE TABLE "pontos_midia" (
    "id" SERIAL NOT NULL,
    "nome_empresa" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "instagram_site" TEXT,
    "cep" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "possui_tv" BOOLEAN NOT NULL,
    "quantidade_tvs" INTEGER,
    "local_instalacao" TEXT,
    "fluxo_diario_estimado" TEXT NOT NULL,
    "tempo_permanencia" TEXT NOT NULL,
    "faixa_etaria_publico" TEXT[],
    "genero_publico" TEXT NOT NULL,
    "horarios_pico" TEXT,
    "valor_desejado" TEXT NOT NULL,
    "categorias_recusadas" TEXT[],
    "intencao_real" TEXT NOT NULL,
    "aceita_contato" BOOLEAN NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pontos_midia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anunciantes" (
    "id" SERIAL NOT NULL,
    "nome_empresa" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "instagram_site" TEXT,
    "cep" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "o_que_anunciar" TEXT NOT NULL,
    "descricao_anuncio" TEXT NOT NULL,
    "preferencia_localizacao" TEXT NOT NULL,
    "distancia_maxima" TEXT,
    "bairros_especificos" TEXT,
    "categorias_especificas" TEXT[],
    "faixa_etaria_alvo" TEXT[],
    "genero_alvo" TEXT NOT NULL,
    "valor_investimento" TEXT NOT NULL,
    "ja_investe_publicidade" BOOLEAN NOT NULL,
    "onde_investe" TEXT[],
    "intencao_real" TEXT NOT NULL,
    "aceita_contato" BOOLEAN NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anunciantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pontos_midia_cidade_idx" ON "pontos_midia"("cidade");

-- CreateIndex
CREATE INDEX "anunciantes_cidade_idx" ON "anunciantes"("cidade");
